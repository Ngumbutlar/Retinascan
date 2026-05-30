from flask import Blueprint, jsonify
from app.models.facility import Facility

facility_bp = Blueprint('facility_bp', __name__)

@facility_bp.route('', methods=['GET'])
def list_facilities():
    """
    Retrieve all registered healthcare facilities.
    ---
    responses:
      200:
        description: A list of facilities.
        schema:
          type: array
          items:
            properties:
              id: {type: integer}
              name: {type: string}
              location: {type: string}
    """
    facilities = Facility.query.all()
    return jsonify([f.to_dict() for f in facilities]), 200