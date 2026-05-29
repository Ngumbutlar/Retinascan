from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flasgger import Swagger
from typing import Any, Optional

# Initialize Flask extensions

# In-memory blocklist for JWT tokens. In a production environment,
# this should be a persistent storage like Redis or a database.
BLOCKLIST: set = set()

@jwt.token_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload) -> bool:
    """Callback function to check if a JWT has been revoked or is in the blocklist."""
    jti = jwt_payload["jti"]
    return jti in BLOCKLIST
db: SQLAlchemy = SQLAlchemy()
jwt: JWTManager = JWTManager()
bcrypt: Bcrypt = Bcrypt()
cors: CORS = CORS()

class FlasggerWrapper:
    """
    A wrapper for Flasgger's Swagger to provide an init_app method,
    allowing it to conform to the application factory pattern.
    """
    def __init__(self) -> None:
        self.swagger_instance: Optional[Swagger] = None

    def init_app(self, app: Flask) -> None:
        """
        Initializes Flasgger with the given Flask application and its configuration.
        Flasgger typically takes its configuration directly or from app.config['SWAGGER'].
        This method passes the app's configuration, allowing Flasgger to pick up
        the 'SWAGGER' key if present.
        """
        self.swagger_instance = Swagger(app, config=app.config.get('SWAGGER'))

swagger: FlasggerWrapper = FlasggerWrapper()
