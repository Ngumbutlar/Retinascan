import os
from flask import Flask
from app.config import Config
from app.extensions import db, jwt, bcrypt, cors
from flasgger import Swagger
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure the instance folder exists for SQLite
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Step 1: Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Step 2: Register ALL blueprints first
    from app.routes.auth import auth_bp
    from app.routes.health import health_bp
    from app.routes.facility import facility_bp
    from app.routes.screening import new_screening_bp
    from app.routes.predict import predict_bp

    # Ensure these exist in your routes directory
    try:
        from app.routes.records import records_bp
        app.register_blueprint(records_bp, url_prefix='/records')
    except ImportError:
        pass

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(facility_bp, url_prefix='/auth/facilities')
    app.register_blueprint(health_bp)
    app.register_blueprint(new_screening_bp, url_prefix='/api')
    app.register_blueprint(predict_bp)

    # Step 3: Initialise Swagger LAST
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs",
    }
    
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "RetinaScan API",
            "description": "Diabetic retinopathy screening backend",
            "version": "1.0.0"
        },
        "basePath": "/",
        "schemes": ["http", "https"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Enter: Bearer <your_token>"
            }
        }
    }

    Swagger(app, config=swagger_config, template=swagger_template)

    return app
