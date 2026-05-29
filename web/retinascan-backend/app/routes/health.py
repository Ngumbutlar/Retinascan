from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health():
    """
    Health Check Endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: API is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: ok
            service:
              type: string
              example: RetinaScan API
    """
    return jsonify({"status": "ok", "service": "RetinaScan API"}), 200