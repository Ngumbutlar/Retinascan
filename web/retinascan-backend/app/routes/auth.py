from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
from app.extensions import db, jwt, BLOCKLIST
from app.models.user import User

# Blueprint created without prefix here because it is defined in create_app
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'], endpoint='login')
def login():
    """
    Login a health worker
    ---
    tags:
      - Authentication
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: admin@retinascan.com
            password:
              type: string
              example: "1234"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            access_token:
              type: string
            user:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
                email:
                  type: string
                role:
                  type: string
      400:
        description: Invalid request body or missing fields
      401:
        description: Invalid credentials
    """
    data = request.get_json(force=True, silent=False)
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    identity = str(user.id)
    access_token = create_access_token(identity=identity, expires_delta=timedelta(hours=8))
    return jsonify(access_token=access_token, user=user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'], endpoint='logout')
@jwt_required()
def logout():
    """
    User Logout
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
        schema:
          type: object
          properties:
            message:
              type: string
      401:
        description: Unauthorized
    """
    jti = get_jwt()["jti"]
    BLOCKLIST.add(jti)
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/me', methods=['GET'], endpoint='me')
@jwt_required()
def me():
    """
    Get Current User Details
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Returns details of the currently logged-in user
        schema:
          type: object
          properties:
            user:
              type: object
              properties:
                id: {type: integer}
                name: {type: string}
                email: {type: string}
                role: {type: string}
      401:
        description: Unauthorized
      404:
        description: User not found
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user=user.to_dict()), 200
