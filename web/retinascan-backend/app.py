import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.services.model_service import predict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS to allow the React frontend to communicate with this API
CORS(app)

@app.route('/api/new-screening', methods=['POST'])
def analyze_screening():
    """
    Endpoint to receive a fundus image and return the DR classification results
    integrated with clinical recommendations.
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

if __name__ == '__main__':
    # Run the Flask development server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
