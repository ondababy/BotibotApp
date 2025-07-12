from flask import Blueprint, jsonify
from app.controllers.auth_controller import register, login, get_user_profile, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Test endpoint for connectivity
@auth_bp.route('/test', methods=['GET'])
def test_connection():
    return jsonify({
        'message': 'Server is running',
        'status': 'success',
        'timestamp': str(__import__('datetime').datetime.now())
    })

# Registration route
auth_bp.route('/register', methods=['POST'])(register)

# Login route
auth_bp.route('/login', methods=['POST'])(login)

# Protected profile route
auth_bp.route('/profile', methods=['GET'])(token_required(get_user_profile))