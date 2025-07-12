#!/usr/bin/env python3
"""
Script to update the test user with a properly hashed password
"""

import sys
import os
from werkzeug.security import generate_password_hash
from bson import ObjectId

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    from app.utils.db_connection import db_instance
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

def update_test_user():
    """Update test user with proper hashed password"""
    
    try:
        # Connect to database
        db_instance.connect()
        print("✅ Connected to MongoDB")
        
        db = db_instance.get_db()
        users_collection = db.users
        
        # Test user credentials
        test_email = "test@example.com"
        test_password = "123"  # Simple password for testing
        
        # Hash the password
        hashed_password = generate_password_hash(test_password)
        
        # Update the test user
        result = users_collection.update_one(
            {'email': test_email},
            {
                '$set': {
                    'password': hashed_password,
                    'firstName': 'Test',
                    'lastName': 'User',
                    'age': 25,
                    'address': 'Test Address',
                    'contactNumber': '1234567890',
                    'emergencyContactName': 'Emergency Contact',
                    'emergencyContactNumber': '0987654321'
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Updated test user: {test_email}")
            print(f"🔐 New password: {test_password}")
            print(f"📧 Email: {test_email}")
            print("\n🧪 You can now test with these credentials:")
            print(f"   Email: {test_email}")
            print(f"   Password: {test_password}")
        else:
            print(f"❌ Test user not found or no changes made")
            
    except Exception as e:
        print(f"❌ Error updating test user: {e}")

if __name__ == "__main__":
    update_test_user()
