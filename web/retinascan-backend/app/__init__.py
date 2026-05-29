import os
from flask import Flask
from typing import Type

# Import extensions
from app.extensions import db, jwt, bcrypt, cors, swagger
# Import configuration
from app.config import Config

# Import blueprints (assuming they are defined as 'auth_bp', etc., in their files)
from app.routes.auth import auth_bp
from app.routes.predict import predict_bp
from app.routes.records import records_bp
from app.routes.health import health_bp


def create_app(config_class: Type[Config] = Config) -> Flask:
    """
    Flask application factory function.
    Initializes the Flask app, configures extensions, and registers blueprints.

    Args:
        config_class: The configuration class to use for the app. Defaults to Config.

    Returns:
        A configured Flask application instance.
    """
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # Ensure the instance folder exists for SQLite/logs
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize extensions with the app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    # Configure CORS to allow requests from FRONTEND_URL
    cors.init_app(app, resources={r"/*": {"origins": app.config['FRONTEND_URL']}})
    swagger.init_app(app) # Flasgger initialization via wrapper

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(health_bp, url_prefix='/api/health')

    return app
