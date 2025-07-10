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
        # Hash the password before storing
        if 'password' in user_data:
            user_data['password'] = generate_password_hash(user_data['password'])
        
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        
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
    def verify_password(cls, stored_password, provided_password):
        """Verify the provided password against the stored hash"""
        return check_password_hash(stored_password, provided_password)