from datetime import datetime
from bson import ObjectId
from app.utils.db_connection import db_instance
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    @classmethod
    def get_collection(cls):
        """Get the users collection"""
        return db_instance.get_db().users
    
    @classmethod
    def create_user(cls, user_data):
        """Create a new user in the database"""
        # Hash the PIN code before storing
        if 'pinCode' in user_data:
            user_data['pinCode'] = generate_password_hash(user_data['pinCode'])
        
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        # Add face-related fields
        user_data['face_id'] = None
        user_data['face_registered'] = False
        user_data['face_samples_count'] = 0
        
        result = cls.get_collection().insert_one(user_data)
        return result.inserted_id
    
    @classmethod
    def find_by_email(cls, email):
        """Find a user by email"""
        return cls.get_collection().find_one({'email': email})
    
    @classmethod
    def find_by_id(cls, user_id):
        """Find a user by ID"""
        return cls.get_collection().find_one({'_id': ObjectId(user_id)})
    
    @classmethod
    def update_user(cls, user_id, update_data):
        """Update user information"""
        update_data['updated_at'] = datetime.utcnow()
        return cls.get_collection().update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
    
    @classmethod
    def update_face_data(cls, user_id, face_id, samples_count):
        """Update user's face registration data"""
        update_data = {
            'face_id': face_id,
            'face_registered': True,
            'face_samples_count': samples_count,
            'updated_at': datetime.utcnow()
        }
        return cls.get_collection().update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
    
    @classmethod
    def verify_pin_code(cls, stored_pin, provided_pin):
        """Verify the provided PIN code against the stored hash"""
        return check_password_hash(stored_pin, provided_pin)
    
    @classmethod
    def verify_password(cls, stored_password, provided_password):
        """Verify the provided password against the stored hash (for backward compatibility)"""
        return check_password_hash(stored_password, provided_password)