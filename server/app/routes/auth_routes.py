from flask import Blueprint
from app.controllers.auth_controller import register, login, get_user_profile, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Registration route
auth_bp.route('/register', methods=['POST'])(register)

# Login route
auth_bp.route('/login', methods=['POST'])(login)

# Protected profile route
auth_bp.route('/profile', methods=['GET'])(token_required(get_user_profile))