from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.screening import ScreeningRecord
from datetime import datetime, date
import json

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """
    Get dashboard statistics
    ---
    tags:
      - Dashboard
    security:
      - Bearer: []
    responses:
      200:
        description: Dashboard statistics
    """
    today = date.today()
    first_of_month = today.replace(day=1)

    screenings_today = ScreeningRecord.query.filter(
        db.func.date(ScreeningRecord.created_at) == today
    ).count()

    screenings_this_month = ScreeningRecord.query.filter(
        ScreeningRecord.created_at >= datetime.combine(
            first_of_month, datetime.min.time()
        )
    ).count()

    screenings_total = ScreeningRecord.query.count()

    # Count referrals — grade >= 1 means referral recommended
    referrals_generated = ScreeningRecord.query.filter(
        ScreeningRecord.grade >= 1
    ).count()

    # Grade distribution
    grade_names = {
        0: 'No DR', 1: 'Mild', 2: 'Moderate',
        3: 'Severe', 4: 'Proliferative'
    }
    grade_distribution = {}
    for grade_val, grade_name in grade_names.items():
        count = ScreeningRecord.query.filter(
            ScreeningRecord.grade == grade_val
        ).count()
        grade_distribution[grade_name] = count

    # Recent screenings — last 5
    recent = ScreeningRecord.query.order_by(
        ScreeningRecord.created_at.desc()
    ).limit(5).all()

    recent_list = []
    for r in recent:
        try:
            rec_json = json.loads(r.recommendation) if r.recommendation else {}
        except (json.JSONDecodeError, TypeError):
            rec_json = {}

        recent_list.append({
            'id'                    : r.id,
            'patient_name'          : r.patient_name,
            'patient_age'           : r.patient_age,
            'eye'                   : r.eye,
            'grade'                 : r.grade,
            'grade_label'           : r.grade_label,
            'confidence'            : round(r.confidence, 2) if r.confidence else 0,
            'recommendation_color'  : rec_json.get('color', '#2E8B57'),
            'recommendation_urgency': rec_json.get('urgency', 'Routine'),
            'refer'                 : rec_json.get('refer', False),
            'screened_at'           : r.created_at.isoformat() if r.created_at else None
        })

    return jsonify({
        'stats': {
            'screenings_today'    : screenings_today,
            'screenings_this_month': screenings_this_month,
            'screenings_total'    : screenings_total,
            'referrals_generated' : referrals_generated,
            'grade_distribution'  : grade_distribution
        },
        'recent_screenings': recent_list
    }), 200