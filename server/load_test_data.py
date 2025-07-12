#!/usr/bin/env python3
"""
Script to populate MongoDB with test schedule data.
This will help test if the schedule reading functionality is working.
"""

import json
import sys
import os
from datetime import datetime, timezone
from bson import ObjectId

# Add the app directory to the path so we can import our models
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    from app.utils.db_connection import db_instance
    from app.models.schedule_model import Schedule
    from app.models.user_model import User
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running this script from the server directory")
    sys.exit(1)

def load_test_data():
    """Load test schedule data from JSON file into MongoDB"""
    
    # Connect to database
    try:
        db_instance.connect()
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        return False
    
    # Load JSON data
    try:
        with open('test_schedule_data.json', 'r') as f:
            data = json.load(f)
        print("✅ Loaded test data from JSON file")
    except FileNotFoundError:
        print("❌ test_schedule_data.json file not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return False
    
    # Get database collections
    db = db_instance.get_db()
    users_collection = db.users
    schedules_collection = db.medication_schedules
    logs_collection = db.medication_logs
    
    try:
        # Insert test user (if not exists)
        test_user = data['test_user']
        existing_user = users_collection.find_one({'email': test_user['email']})
        
        if not existing_user:
            # Create user with ObjectId
            user_doc = {
                '_id': ObjectId(test_user['_id']),
                'username': test_user['username'],
                'email': test_user['email'],
                'password': 'hashed_password_here',  # You would hash this in real scenario
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            users_collection.insert_one(user_doc)
            print(f"✅ Created test user: {test_user['email']}")
            user_id = ObjectId(test_user['_id'])
        else:
            print(f"✅ Test user already exists: {test_user['email']}")
            user_id = existing_user['_id']
        
        # Clear existing schedules for test user
        deleted_schedules = schedules_collection.delete_many({'user_id': user_id})
        print(f"🗑️ Cleared {deleted_schedules.deleted_count} existing schedules")
        
        # Insert test schedules
        schedule_ids = []
        for i, schedule_data in enumerate(data['schedules']):
            # Generate ObjectId for each schedule
            schedule_id = ObjectId()
            schedule_ids.append(schedule_id)
            
            # Prepare schedule document
            schedule_doc = {
                '_id': schedule_id,
                'user_id': user_id,
                'medication_name': schedule_data['medication_name'],
                'dosage': schedule_data['dosage'],
                'frequency': schedule_data['frequency'],
                'times': schedule_data['times'],
                'start_date': schedule_data['start_date'],
                'end_date': schedule_data['end_date'],
                'days_of_week': schedule_data['days_of_week'],
                'notes': schedule_data['notes'],
                'reminder_enabled': schedule_data['reminder_enabled'],
                'is_active': schedule_data.get('is_active', True),
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            schedules_collection.insert_one(schedule_doc)
            print(f"✅ Created schedule: {schedule_data['medication_name']}")
        
        print(f"✅ Successfully created {len(schedule_ids)} test schedules")
        
        # Clear existing logs and insert test logs
        deleted_logs = logs_collection.delete_many({})
        print(f"🗑️ Cleared {deleted_logs.deleted_count} existing logs")
        
        # Insert test medication logs
        for i, log_data in enumerate(data['medication_logs']):
            # Use one of the created schedule IDs (assign to schedules cyclically)
            schedule_index = i % len(schedule_ids)
            
            log_doc = {
                '_id': ObjectId(),
                'schedule_id': schedule_ids[schedule_index],
                'status': log_data['status'],
                'taken_at': log_data['taken_at'],
                'notes': log_data['notes'],
                'created_at': datetime.now(timezone.utc)
            }
            
            logs_collection.insert_one(log_doc)
        
        print(f"✅ Successfully created {len(data['medication_logs'])} test logs")
        
        # Print summary
        print("\n" + "="*50)
        print("📊 TEST DATA SUMMARY:")
        print("="*50)
        print(f"👤 Test User: {test_user['email']}")
        print(f"💊 Schedules Created: {len(schedule_ids)}")
        print(f"📝 Logs Created: {len(data['medication_logs'])}")
        print(f"🆔 User ID: {user_id}")
        
        print("\n📋 SCHEDULES:")
        for i, schedule in enumerate(data['schedules']):
            print(f"  {i+1}. {schedule['medication_name']} - {schedule['dosage']} ({schedule['frequency']})")
        
        print(f"\n🔗 API Testing:")
        print(f"  Test with: GET /api/schedule")
        print(f"  Test with: GET /api/schedule/today")
        print(f"  User ID for auth: {user_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inserting test data: {e}")
        return False

def test_schedule_reading():
    """Test reading schedules using our Schedule model"""
    
    print("\n" + "="*50)
    print("🧪 TESTING SCHEDULE READING:")
    print("="*50)
    
    try:
        # Test user ID from our test data
        test_user_id = "507f1f77bcf86cd799439011"
        
        # Test getting all schedules for user
        schedules = Schedule.find_by_user(test_user_id)
        print(f"✅ Found {len(schedules)} schedules for user")
        
        for schedule in schedules:
            print(f"  📅 {schedule['medication_name']} - {schedule['dosage']}")
            print(f"     Times: {', '.join(schedule['times'])}")
            print(f"     Frequency: {schedule['frequency']}")
            print()
        
        # Test getting today's schedules
        today_schedules = Schedule.get_schedules_for_today(test_user_id)
        print(f"✅ Found {len(today_schedules)} schedules for today")
        
        for schedule in today_schedules:
            print(f"  🕐 {schedule['medication_name']} at {', '.join(schedule['times'])}")
        
        # Test getting logs
        logs = Schedule.get_logs_by_user(test_user_id)
        print(f"✅ Found {len(logs)} medication logs")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing schedule reading: {e}")
        return False

def main():
    """Main function to run the test data setup"""
    
    print("🚀 BOTIBOT SCHEDULE TEST DATA LOADER")
    print("="*50)
    
    # Load test data
    if not load_test_data():
        print("❌ Failed to load test data")
        return
    
    # Test reading functionality
    if not test_schedule_reading():
        print("❌ Failed to test schedule reading")
        return
    
    print("\n🎉 All tests completed successfully!")
    print("\n💡 Next steps:")
    print("  1. Start your Flask server: python main.py")
    print("  2. Test the API endpoints:")
    print("     - GET /api/schedule")
    print("     - GET /api/schedule/today")
    print("  3. Use the test user credentials in your mobile app")
    print("     Email: test@example.com")
    print("     Password: testpassword123")

if __name__ == "__main__":
    main()
