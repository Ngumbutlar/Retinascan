from flask import Blueprint, request, jsonify
from app.services.model_service import predict
import logging

logger = logging.getLogger(__name__)

# Define the blueprint for screening-related tasks
new_screening_bp = Blueprint('new-screening', __name__)

@new_screening_bp.route('/new-screening', methods=['POST'])
def analyze_screening():
    """
    Endpoint to receive a fundus image and return the DR classification results.
    ---
    tags:
      - New Screening
    consumes:
      - multipart/form-data
    parameters:
      - name: image
        in: formData
        type: file
        required: true
        description: The fundus image file to analyze.
    responses:
      200:
        description: Analysis results including grade and clinical recommendations.
      400:
        description: Missing image file or invalid request.
      503:
        description: AI Model not loaded.
    """
    # 1. Check if the image file is present in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    image_file = request.files['image']
    
    if image_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # 2. Read the image bytes
        image_bytes = image_file.read()
        
        # 3. Perform prediction (includes preprocessing and recommendation lookup)
        result = predict(image_bytes)
        
        # 4. Handle service errors (e.g., model file not found)
        if "error" in result:
            status_code = result.get("status_code", 500)
            return jsonify({"error": result["error"]}), status_code
            
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {e}")
        return jsonify({"error": "An internal error occurred during image processing."}), 500
