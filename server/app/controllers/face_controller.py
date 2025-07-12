from flask import request, jsonify
import jwt
import os
from app.services.face_recognition_service import FaceRecognitionService
from app.models.user_model import User


def get_current_user():
    """Get current user from JWT token"""
    token = None
    auth_header = request.headers.get('Authorization')
    
    print(f"Auth header: {auth_header}")  # Debug log
    
    if auth_header:
        try:
            token = auth_header.split(" ")[1]  # Bearer <token>
            print(f"Extracted token: {token[:20]}...")  # Debug log (partial token)
        except IndexError:
            print("Failed to extract token from header")
            return None
    
    if not token:
        print("No token found")
        return None
    
    try:
        secret_key = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
        data = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = data['sub']  # Use 'sub' to match auth controller
        print(f"Decoded user_id: {user_id}")  # Debug log
        user = User.find_by_id(user_id)
        if user:
            print(f"Found user: {user.get('email', 'unknown')}")
        else:
            print("User not found in database")
        return user
    except Exception as e:
        print(f"Token validation error: {e}")
        return None


def register_face():
    """Register face samples for the authenticated user"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get request data
        data = request.get_json()
        if not data or 'images' not in data:
            return jsonify({'error': 'Images are required'}), 400
        
        images = data['images']
        
        # Validate images
        if not isinstance(images, list):
            return jsonify({'error': 'Images must be an array'}), 400
        
        if len(images) < 3:
            return jsonify({'error': 'Minimum 3 images required'}), 400
        
        if len(images) > 30:
            return jsonify({'error': 'Maximum 30 images allowed'}), 400
        
        # Initialize face recognition service
        face_service = FaceRecognitionService()
        
        # Register face samples
        result = face_service.register_face_samples(str(user['_id']), images)
        
        return jsonify({
            'message': f'Face registration completed successfully. {result["samples_saved"]} samples saved and model trained.',
            'success': True,
            'face_id': result['face_id'],
            'samples_saved': result['samples_saved'],
            'results': result['results']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Face registration failed: {str(e)}'}), 500


def recognize_face():
    """Recognize a face from an uploaded image"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get request data
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'Image is required'}), 400
        
        image = data['image']
        
        # Initialize face recognition service
        face_service = FaceRecognitionService()
        
        # Recognize face
        result = face_service.recognize_face(image)
        
        if result['recognized']:
            return jsonify({
                'message': 'Face recognized successfully',
                'success': True,
                'recognized_user': result['user'],
                'confidence_data': {
                    'confidence': result['confidence'],
                    'accuracy': result['accuracy']
                }
            }), 200
        else:
            return jsonify({
                'message': 'Face not recognized',
                'success': False,
                'confidence_data': {
                    'confidence': result['confidence'],
                    'accuracy': result['accuracy']
                }
            }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Face recognition failed: {str(e)}'}), 500


def get_face_status():
    """Check if the authenticated user has registered face samples"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Initialize face recognition service
        face_service = FaceRecognitionService()
        
        # Check if user has face registered
        has_face = face_service.user_has_face_registered(str(user['_id']))
        
        return jsonify({
            'face_registered': has_face,
            'user_id': str(user['_id']),
            'face_id': user.get('face_id')
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get face status: {str(e)}'}), 500


def delete_face_data():
    """Delete all face samples for the authenticated user"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Initialize face recognition service
        face_service = FaceRecognitionService()
        
        # Delete user's face data
        face_service.delete_user_face_data(str(user['_id']))
        
        return jsonify({
            'message': 'User face data deleted successfully',
            'success': True
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to delete face data: {str(e)}'}), 500