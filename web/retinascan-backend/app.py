import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.services.model_service import predict
from app.routes.records import records_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# JWT Configuration - Required for @jwt_required() decorators in routes
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
jwt = JWTManager(app)

# Enable CORS with specific support for the frontend origin and credentials
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Handle OPTIONS preflight requests explicitly.
# This ensures preflight requests (which don't carry JWTs) aren't blocked by auth decorators.
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return jsonify(success=True), 200

# Register clinical records blueprint
app.register_blueprint(records_bp)

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
