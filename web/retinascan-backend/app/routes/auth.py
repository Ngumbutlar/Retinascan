from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
from typing import Dict, Any

from app.extensions import db, bcrypt, jwt, BLOCKLIST
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login() -> tuple[Dict[str, Any], int]:
    """
    User Login
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        schema:
          id: UserLogin
          required:
            - email
            - password
          properties:
            email:
              type: string
              description: User's email address.
              example: admin@retinascan.com
            password:
              type: string
              description: User's password.
              example: Admin1234!
    responses:
      200:
        description: Login successful, returns access token and user details.
        schema:
          id: LoginSuccess
          properties:
            access_token:
              type: string
              description: JWT access token.
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
                facility:
                  type: string
      400:
        description: Missing email or password.
        schema:
          $ref: '#/definitions/ErrorResponse'
      401:
        description: Invalid credentials.
        schema:
          $ref: '#/definitions/ErrorResponse'
    """
    email = request.json.get('email', None) if request.json else None
    password = request.json.get('password', None) if request.json else None

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_pin(password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Token expires after 8 hours as per request.
    # This overrides the JWT_ACCESS_TOKEN_EXPIRES setting in config.py if it's different.
    access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=8))
    return jsonify(access_token=access_token, user=user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout() -> tuple[Dict[str, str], int]:
    """
    User Logout
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully.
        schema:
          $ref: '#/definitions/ErrorResponse'
      401:
        description: Unauthorized (missing or invalid token).
        schema:
          $ref: '#/definitions/ErrorResponse'
    """
    jti = get_jwt()["jti"]
    BLOCKLIST.add(jti) # Add the current JWT's unique identifier to the blocklist
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me() -> tuple[Dict[str, Any], int]:
    """
    Get Current User Details
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Returns details of the currently logged-in user.
        schema:
          $ref: '#/definitions/LoginSuccess'
      401:
        description: Unauthorized (missing or invalid token).
        schema:
          $ref: '#/definitions/ErrorResponse'
      404:
        description: User not found (should not happen with valid token).
        schema:
          $ref: '#/definitions/ErrorResponse'
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        # This case should ideally not be hit if the token is valid and the user exists in the DB.
        return jsonify({"message": "User not found"}), 404

    return jsonify(user=user.to_dict()), 200