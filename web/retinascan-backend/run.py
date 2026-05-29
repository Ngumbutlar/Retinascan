import os
from app import create_app

def main() -> None:
    """
    Entry point for running the Flask application.
    Creates the app instance and runs it in debug mode on port 8000.
    """
    app = create_app()
    
    # Allow host and port to be overridden by environment variables
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_RUN_PORT', 8000))
    
    app.run(debug=True, host=host, port=port)

if __name__ == '__main__':
    main()
