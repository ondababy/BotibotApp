#!/usr/bin/env python3
"""
Migration script to convert existing users from password-based authentication to PIN code authentication.
This script will:
1. Find all users with 'password' field
2. Add a default PIN code (users will need to reset this)
3. Optionally remove the old password field
"""

import os
import sys
from datetime import datetime

# Add the server directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.db_connection import db_instance
from werkzeug.security import generate_password_hash

def migrate_users_to_pincode():
    """Migrate existing users from password to PIN code authentication"""
    
    try:
        # Connect to database
        db_instance.connect()
        users_collection = db_instance.get_db().users
        
        # Find all users that have 'password' field but no 'pinCode' field
        users_to_migrate = users_collection.find({
            'password': {'$exists': True},
            'pinCode': {'$exists': False}
        })
        
        migration_count = 0
        
        for user in users_to_migrate:
            user_id = user['_id']
            email = user.get('email', 'Unknown')
            
            print(f"Migrating user: {email}")
            
            # Set a default PIN code (1234) - users should change this after login
            default_pin = "1234"
            hashed_pin = generate_password_hash(default_pin)
            
            # Update the user with PIN code and keep password for backward compatibility
            update_result = users_collection.update_one(
                {'_id': user_id},
                {
                    '$set': {
                        'pinCode': hashed_pin,
                        'updated_at': datetime.utcnow(),
                        'migration_note': f'Migrated from password to PIN on {datetime.utcnow().isoformat()}'
                    }
                }
            )
            
            if update_result.modified_count > 0:
                migration_count += 1
                print(f"✓ Successfully migrated user: {email}")
            else:
                print(f"✗ Failed to migrate user: {email}")
        
        print(f"\nMigration completed!")
        print(f"Total users migrated: {migration_count}")
        print(f"Default PIN code for migrated users: 1234")
        print(f"⚠️  Users should change their PIN code after first login!")
        
        return migration_count
        
    except Exception as e:
        print(f"Migration failed with error: {str(e)}")
        return 0
    finally:
        # Close database connection
        try:
            db_instance.close()
        except:
            pass

def remove_old_passwords():
    """Optional: Remove old password fields after successful migration"""
    
    try:
        db_instance.connect()
        users_collection = db_instance.get_db().users
        
        # Find users that have both password and pinCode
        users_with_both = users_collection.find({
            'password': {'$exists': True},
            'pinCode': {'$exists': True}
        })
        
        removal_count = 0
        
        for user in users_with_both:
            user_id = user['_id']
            email = user.get('email', 'Unknown')
            
            # Remove the old password field
            update_result = users_collection.update_one(
                {'_id': user_id},
                {
                    '$unset': {'password': ''},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            
            if update_result.modified_count > 0:
                removal_count += 1
                print(f"✓ Removed password field for user: {email}")
        
        print(f"\nPassword field removal completed!")
        print(f"Total users cleaned: {removal_count}")
        
        return removal_count
        
    except Exception as e:
        print(f"Password removal failed with error: {str(e)}")
        return 0
    finally:
        try:
            db_instance.close()
        except:
            pass

if __name__ == "__main__":
    print("=== User Migration Script: Password to PIN Code ===\n")
    
    # Migrate users to PIN code
    migrated_count = migrate_users_to_pincode()
    
    if migrated_count > 0:
        print("\n" + "="*50)
        response = input("Do you want to remove old password fields? (y/N): ").lower().strip()
        
        if response == 'y' or response == 'yes':
            remove_old_passwords()
        else:
            print("Keeping old password fields for backward compatibility.")
    
    print("\n=== Migration Script Completed ===")
