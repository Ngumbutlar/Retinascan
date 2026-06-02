import os
from datetime import timedelta
from dotenv import load_dotenv
from typing import Dict, Any, List, Union

# Define base directory for robust path resolution
basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Base configuration class for the Flask application.
    Loads sensitive information and settings from environment variables
    and defines other application-wide configurations.
    """
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'a_very_secret_key_for_dev')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'super_secret_jwt_key_for_dev')
    
    # Use absolute path for SQLite to prevent "database not found" errors
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        'SQLALCHEMY_DATABASE_URI', 
        f"sqlite:///{os.path.join(os.path.dirname(basedir), 'instance', 'retinascan.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    JWT_TOKEN_LOCATION: List[str] = ["headers"]
    JWT_BLOCKLIST_ENABLED: bool = True
    JWT_BLOCKLIST_TOKEN_CHECKS: List[str] = ["access", "refresh"] # Enable blocklisting for access and refresh tokens
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(hours=1)
    MODEL_PATH: str = os.getenv('MODEL_PATH', './app/services/model_weights/retinanet_model.pth')
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'http://localhost:3000') # Default for local frontend development

    # Flasgger UI Configuration
    SWAGGER: Dict[str, Any] = {
        'uiversion': 3,
        'specs_route': '/docs/',
        'static_url_path': '/flasgger_static',
        'specs': [
            {
                'endpoint': 'apispec',
                'route': '/apispec.json',
                'rule_filter': lambda rule: True,  # all in
                'model_filter': lambda tag: True,  # all in
            }
        ],
        'headers': []
    }

    # OpenAPI 3.0 Specification Template
    SWAGGER_TEMPLATE: Dict[str, Any] = {
        'swagger': '2.0',
        'info': {
            'title': 'RetinaScan API',
            'version': '1.0.0',
            'description': 'API for Diabetic Retinopathy Classification',
            'contact': {
                'name': 'API Support',
                'url': 'http://your-support-url.com',
                'email': 'support@example.com'
            },
            'license': {
                'name': 'Apache 2.0',
                'url': 'http://www.apache.org/licenses/LICENSE-2.0.html'
            }
        },
        'basePath': '/api',
        'schemes': ['http', 'https'],
        'securityDefinitions': {
            'Bearer': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
            }
        },
        'security': [
            { 'Bearer': [] }
        ],
        'definitions': {
            'ErrorResponse': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string', 'description': 'Error message.'}
                }
            }
        }
    }
