from flask import request, jsonify
import jwt
from datetime import datetime, timezone, timedelta
from app.models.user_model import User
from app.utils.validations import validate_login_data, validate_registration_data
from functools import wraps
import os

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'botibot_secret_key_2025')

def generate_token(user_id):
    """Generate a JWT token for the user"""
    payload = {
        'exp': datetime.now(timezone.utc) + timedelta(days=1),
        'iat': datetime.now(timezone.utc),
        'sub': str(user_id)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    """Decorator for protected routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.find_by_id(data['sub'])
            
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def register():
    if not request.is_json:
        return jsonify({'message': 'Missing JSON in request'}), 400
        
    data = request.get_json()
    
    # Validate the registration data
    validation_errors = validate_registration_data(data)
    if validation_errors:
        return jsonify({'message': 'Validation failed', 'errors': validation_errors}), 400
    
    # Check if user already exists
    existing_user = User.find_by_email(data['email'])
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 409
    
    # Create user object
    user_data = {
        'firstName': data['firstName'],
        'lastName': data['lastName'],
        'middleName': data.get('middleName', ''),
        'age': int(data['age']),
        'address': data['address'],
        'email': data['email'],
        'password': data['password'],
        'contactNumber': data['contactNumber'],
        'emergencyContactName': data['emergencyContactName'],
        'emergencyContactNumber': data['emergencyContactNumber']
    }
    
    # Save user to database
    user_id = User.create_user(user_data)
    
    # Generate authentication token
    token = generate_token(user_id)
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': {
            'id': str(user_id),
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email']
        }
    }), 201

def login():
    """Handle user login"""
    if not request.is_json:
        return jsonify({'message': 'Missing JSON in request'}), 400
        
    data = request.get_json()
    
    # Validate login data
    validation_errors = validate_login_data(data)
    if validation_errors:
        return jsonify({'message': 'Validation failed', 'errors': validation_errors}), 400
    
    # Find user by email
    user = User.find_by_email(data['email'])
    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Verify password
    if not User.verify_password(user['password'], data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Generate authentication token
    token = generate_token(user['_id'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': str(user['_id']),
            'firstName': user['firstName'],
            'lastName': user['lastName'],
            'email': user['email']
        }
    }), 200

def get_user_profile(current_user):
    """Get current user's profile"""
    user_data = {
        'id': str(current_user['_id']),
        'firstName': current_user['firstName'],
        'lastName': current_user['lastName'],
        'middleName': current_user.get('middleName', ''),
        'age': current_user['age'],
        'address': current_user['address'],
        'email': current_user['email'],
        'contactNumber': current_user['contactNumber'],
        'emergencyContactName': current_user['emergencyContactName'],
        'emergencyContactNumber': current_user['emergencyContactNumber'],
        'created_at': current_user['created_at'].isoformat() if 'created_at' in current_user else None
    }
    
    return jsonify({
        'user': user_data
    }), 200