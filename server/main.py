from flask import Flask
from flask_cors import CORS
from config import config
from app.utils.db_connection import db_instance
import os
from app.routes.auth_routes import auth_bp
from app.routes.schedule_routes import schedule_bp

def create_app(config_name=None):
    """Application factory"""
    app = Flask(__name__)
    
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    CORS(app)

    with app.app_context():
        db_instance.connect()
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(schedule_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host="192.168.1.42", port=5000)