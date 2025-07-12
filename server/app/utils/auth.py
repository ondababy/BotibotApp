from flask import request, jsonify, current_app
from functools import wraps
import jwt
from datetime import datetime, timezone, timedelta
from app.utils.db_connection import db_instance
from bson.objectid import ObjectId
import os

# Use the same secret key as auth_controller
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'botibot_secret_key_2025')

def generate_token(user_id):
    """
    Generate a JWT token for a user
    
    Args:
        user_id: The user's ID (ObjectId or str)
    
    Returns:
        str: JWT token
    """
    expiration = datetime.now(timezone.utc) + timedelta(hours=12)
    
    # Convert ObjectId to string if needed
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
        
    payload = {
        'exp': expiration,
        'iat': datetime.now(timezone.utc),
        'sub': user_id
    }
    
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm='HS256'
    )

def token_required(f):
    """
    Decorator for protecting routes with JWT authentication
    
    Usage:
        @token_required
        def protected_route(current_user):
            # Function body
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
                
        if not token:
            return jsonify({
                'message': 'Authentication token is missing',
                'authenticated': False
            }), 401
        
        try:
            # Decode the token
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Get user from database
            db = db_instance.get_db()
            user = db.users.find_one({'_id': ObjectId(payload['sub'])})
            
            if not user:
                return jsonify({
                    'message': 'Invalid authentication token',
                    'authenticated': False
                }), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'message': 'Authentication token has expired',
                'authenticated': False
            }), 401
        except (jwt.InvalidTokenError, Exception) as e:
            return jsonify({
                'message': f'Invalid authentication token: {str(e)}',
                'authenticated': False
            }), 401
            
        # Pass the user to the decorated function
        return f(user, *args, **kwargs)
        
    return decorated

def verify_password(plain_password, hashed_password):
    """
    Verify a password against its hash
    
    Args:
        plain_password: The password to verify
        hashed_password: The stored hash
        
    Returns:
        bool: True if password matches, False otherwise
    """
    from werkzeug.security import check_password_hash
    return check_password_hash(hashed_password, plain_password)

def hash_password(password):
    """
    Hash a password for storing
    
    Args:
        password: The password to hash
        
    Returns:
        str: Hashed password
    """
    from werkzeug.security import generate_password_hash
    return generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

def is_token_valid(token):
    """
    Check if a token is valid
    
    Args:
        token: The JWT token to validate
        
    Returns:
        bool: True if token is valid, False otherwise
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('SECRET_KEY'),
            algorithms=['HS256']
        )
        
        # Get user from database to verify existence
        db = db_instance.get_db()
        user = db.users.find_one({'_id': ObjectId(payload['sub'])})
        
        return user is not None
    except:
        return False