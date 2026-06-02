import json
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.services.model_service import predict as run_inference
from app.services.recommendation import get_recommendation
from app.models.screening import ScreeningRecord

logger = logging.getLogger(__name__)

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict', methods=['POST'])
@jwt_required()
def handle_prediction():
    """
    Predict DR severity from a fundus image and save the record.
    ---
    tags:
      - Prediction
    security:
      - Bearer: []
    consumes:
      - multipart/form-data
    parameters:
      - name: image
        in: formData
        type: file
        required: true
        description: The retinal fundus image file.
      - name: patient_name
        in: formData
        type: string
        required: true
      - name: patient_age
        in: formData
        type: integer
        required: true
      - name: patient_sex
        in: formData
        type: string
        enum: [Male, Female]
        required: true
      - name: eye
        in: formData
        type: string
        enum: [Left, Right, Both]
        required: true
      - name: facility_id
        in: formData
        type: integer
        required: true
      - name: hospital_id
        in: formData
        type: string
        required: false
    responses:
      200:
        description: Successful analysis and saved record.
      400:
        description: Invalid request or missing data.
      401:
        description: Unauthorized.
      503:
        description: AI Model engine unavailable.
    """
    # 1. Image presence validation
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Validate mimetype
    if not image.mimetype.startswith('image/'):
        return jsonify({"error": "File must be an image (JPEG/PNG)"}), 400

    # 2. Form data validation
    patient_name = request.form.get('patient_name')
    if not patient_name or patient_name.strip() == "":
        return jsonify({"error": "patient_name is required"}), 400
        
    eye = request.form.get('eye')
    if eye not in ["Left", "Right", "Both"]:
        return jsonify({"error": "eye must be one of: Left, Right, Both"}), 400

    try:
        patient_age = int(request.form.get('patient_age', 0))
        facility_id = int(request.form.get('facility_id', 0))
        patient_sex = request.form.get('patient_sex')
        hospital_id = request.form.get('hospital_id')
        user_id = get_jwt_identity() # Identity set during login

        # 3. Call inference
        # We read the bytes once for processing
        image_bytes = image.read()
        inference_result = run_inference(image_bytes)
        
        if "error" in inference_result:
            status_code = inference_result.get("status", inference_result.get("status_code", 500))
            return jsonify({"error": inference_result["error"]}), status_code

        # 4. Get clinical recommendation
        grade = inference_result['grade']
        rec = get_recommendation(grade)

        # 5. Save to database
        new_record = ScreeningRecord(
            patient_name=patient_name,
            patient_age=patient_age,
            patient_sex=patient_sex,
            hospital_id=hospital_id,
            eye=eye,
            facility_id=facility_id,
            user_id=user_id,
            grade=grade,
            grade_label=inference_result['grade_label'],
            confidence=inference_result['confidence'],
            probabilities=json.dumps(inference_result['probabilities']),
            recommendation=json.dumps(rec),
            image_filename=image.filename
        )

        db.session.add(new_record)
        db.session.commit()

        # 6. Response
        return jsonify({
            "success": True,
            "record_id": new_record.id,
            "patient": {
                "name": patient_name,
                "age": patient_age,
                "sex": patient_sex,
                "hospital_id": hospital_id,
                "eye": eye
            },
            "result": inference_result,
            "recommendation": rec,
            "screened_at": new_record.created_at.isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Error during prediction processing: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "An internal error occurred during processing"}), 500