from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from app.models.screening import ScreeningRecord
from app.services.pdf_service import generate_pdf
from sqlalchemy.orm import joinedload
from datetime import datetime
import json
import io

records_bp = Blueprint('records', __name__)

def format_record_summary(record):
    """Helper to format record for list views."""
    recom = json.loads(record.recommendation) if isinstance(record.recommendation, str) else record.recommendation
    return {
        "id": record.id,
        "patient_name": record.patient_name,
        "patient_age": record.patient_age,
        "patient_sex": record.patient_sex,
        "hospital_id": record.hospital_id,
        "eye": record.eye,
        "grade": record.grade,
        "grade_label": record.grade_label,
        "confidence": record.confidence,
        "recommendation_urgency": recom.get('urgency'),
        "recommendation_color": recom.get('color'),
        "refer": recom.get('refer', False),
        "facility_name": record.facility.name if record.facility else "N/A",
        "screened_at": record.created_at.isoformat()
    }

@records_bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    """
    Get a paginated list of screening records
    ---
    tags:
      - Records
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: grade
        in: query
        type: integer
        description: Filter by DR grade (0-4)
      - name: eye
        in: query
        type: string
        description: Filter by eye (Left, Right, Both)
      - name: search
        in: query
        type: string
        description: Search by patient name
      - name: date_from
        in: query
        type: string
        description: ISO start date
      - name: date_to
        in: query
        type: string
        description: ISO end date
    responses:
      200:
        description: Paginated screening records
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)
    grade = request.args.get('grade', type=int)
    eye = request.args.get('eye')
    search = request.args.get('search')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    query = ScreeningRecord.query.options(joinedload(ScreeningRecord.facility))

    if grade is not None:
        query = query.filter(ScreeningRecord.grade == grade)
    if eye:
        query = query.filter(ScreeningRecord.eye == eye)
    if search:
        query = query.filter(ScreeningRecord.patient_name.ilike(f'%{search}%'))
    if date_from:
        query = query.filter(ScreeningRecord.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(ScreeningRecord.created_at <= datetime.fromisoformat(date_to))

    pagination = query.order_by(ScreeningRecord.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "records": [format_record_summary(r) for r in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    })

@records_bp.route('/records/<int:record_id>', methods=['GET'])
@jwt_required()
def get_record(record_id):
    """
    Get full details for a specific screening record
    ---
    tags:
      - Records
    parameters:
      - name: record_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Detailed record object
      404:
        description: Record not found
    """
    record = ScreeningRecord.query.get_or_404(record_id)
    
    # Include full parsed JSON objects
    probabilities = json.loads(record.probabilities) if isinstance(record.probabilities, str) else record.probabilities
    recommendation = json.loads(record.recommendation) if isinstance(record.recommendation, str) else record.recommendation

    data = {c.name: getattr(record, c.name) for c in record.__table__.columns}
    data['probabilities'] = probabilities
    data['recommendation'] = recommendation
    data['facility_name'] = record.facility.name if record.facility else "N/A"
    
    return jsonify(data)

@records_bp.route('/records/patient/<string:patient_name>', methods=['GET'])
@jwt_required()
def get_patient_history(patient_name):
    """
    Get all screening records for a specific patient
    ---
    tags:
      - Records
    parameters:
      - name: patient_name
        in: path
        type: string
        required: true
    responses:
      200:
        description: Patient-specific history ordered chronologically
    """
    records = ScreeningRecord.query.filter(
        ScreeningRecord.patient_name.ilike(patient_name)
    ).order_by(ScreeningRecord.created_at.asc()).all()

    return jsonify({
        "patient_name": patient_name,
        "total_screenings": len(records),
        "records": [format_record_summary(r) for r in records]
    })

@records_bp.route('/records/<int:record_id>/pdf', methods=['GET'])
@jwt_required()
def get_record_pdf(record_id):
    """Generate and download clinical PDF report"""
    record = ScreeningRecord.query.get_or_404(record_id)
    pdf_bytes = generate_pdf(record)
    
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'RetinaScan-Report-RS{record.id}.pdf'
    )