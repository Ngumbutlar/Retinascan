from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

records_bp = Blueprint('records', __name__)

@records_bp.route('/', methods=['GET'])
@jwt_required()
def get_records():
    """
    Get all patient records
    ---
    tags:
      - Records
    security:
      - Bearer: []
    responses:
      200:
        description: Returns an empty list of records as a stub.
        content:
          application/json:
            schema:
              type: array
              items:
                type: object
    """
    return jsonify([]), 200

@records_bp.route('/', methods=['POST'])
@jwt_required()
def create_record():
    """
    Create a new patient record
    ---
    tags:
      - Records
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            patient_data:
              type: object
              description: JSON body containing patient information.
    responses:
      201:
        description: Successfully created record stub.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
    """
    return jsonify({"message": "Record created successfully (stub)"}), 201