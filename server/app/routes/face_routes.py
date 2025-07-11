from flask import Blueprint
from app.controllers.face_controller import (
    register_face,
    recognize_face,
    get_face_status,
    delete_face_data
)

# Create blueprint for face recognition routes
face_bp = Blueprint('face', __name__, url_prefix='/api/face')

# Register face samples
face_bp.route('/register', methods=['POST'])(register_face)

# Recognize face
face_bp.route('/recognize', methods=['POST'])(recognize_face)

# Get face registration status
face_bp.route('/status', methods=['GET'])(get_face_status)

# Delete face data
face_bp.route('/delete', methods=['DELETE'])(delete_face_data)