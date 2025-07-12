from datetime import datetime
from bson import ObjectId
from app.utils.db_connection import db_instance

class Schedule:
    @classmethod
    def get_collection(cls):
        """Get the medication_schedules collection"""
        return db_instance.get_db().medication_schedules
    
    @classmethod
    def get_logs_collection(cls):
        """Get the medication_logs collection"""
        return db_instance.get_db().medication_logs
    
    @classmethod
    def create_schedule(cls, schedule_data):
        """Create a new medication schedule in the database"""
        schedule_data['created_at'] = datetime.utcnow()
        schedule_data['updated_at'] = datetime.utcnow()
        
        # Ensure user_id is ObjectId
        if 'user_id' in schedule_data and isinstance(schedule_data['user_id'], str):
            schedule_data['user_id'] = ObjectId(schedule_data['user_id'])
        
        result = cls.get_collection().insert_one(schedule_data)
        return result.inserted_id
    
    @classmethod
    def find_by_id(cls, schedule_id):
        """Find a schedule by ID"""
        return cls.get_collection().find_one({'_id': ObjectId(schedule_id)})
    
    @classmethod
    def find_by_user(cls, user_id):
        """Find all schedules for a user"""
        # Convert user_id to ObjectId if it's a string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        return list(cls.get_collection().find({'user_id': user_id}))
    
    @classmethod
    def update_schedule(cls, schedule_id, update_data):
        """Update schedule information"""
        update_data['updated_at'] = datetime.utcnow()
        return cls.get_collection().update_one(
            {'_id': ObjectId(schedule_id)},
            {'$set': update_data}
        )
    
    @classmethod
    def delete_schedule(cls, schedule_id):
        """Delete a schedule"""
        return cls.get_collection().delete_one({'_id': ObjectId(schedule_id)})
    
    @classmethod
    def create_log(cls, log_data):
        """Create a new medication log entry"""
        log_data['created_at'] = datetime.utcnow()
        
        # Ensure schedule_id is ObjectId
        if 'schedule_id' in log_data and isinstance(log_data['schedule_id'], str):
            log_data['schedule_id'] = ObjectId(log_data['schedule_id'])
        
        result = cls.get_logs_collection().insert_one(log_data)
        return result.inserted_id
    
    @classmethod
    def get_logs_by_schedule(cls, schedule_id):
        """Get all logs for a specific schedule"""
        # Convert schedule_id to ObjectId if it's a string
        if isinstance(schedule_id, str):
            schedule_id = ObjectId(schedule_id)
            
        return list(cls.get_logs_collection().find({'schedule_id': schedule_id}).sort('taken_at', -1))
    
    @classmethod
    def get_logs_by_user(cls, user_id):
        """Get all medication logs for a user"""
        # First get all schedules for the user
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        schedules = list(cls.get_collection().find({'user_id': user_id}))
        schedule_ids = [schedule['_id'] for schedule in schedules]
        
        # Then get all logs for those schedules
        return list(cls.get_logs_collection().find(
            {'schedule_id': {'$in': schedule_ids}}
        ).sort('taken_at', -1))
    
    @classmethod
    def get_schedules_for_today(cls, user_id):
        """Get schedules that should be taken today"""
        today = datetime.now().strftime('%Y-%m-%d')
        day_of_week = datetime.now().weekday()  # 0 = Monday, 6 = Sunday
        
        # Convert to Sunday=0 format if your app uses that convention
        sunday_based_day = (day_of_week + 1) % 7  # Convert to 0=Sunday, 1=Monday, etc.
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Find schedules that:
        # 1. Belong to the user
        # 2. Have a start date before or equal to today
        # 3. Have no end date, or an end date after or equal to today
        # 4. Are daily OR have the current day of week in their days_of_week array
        return list(cls.get_collection().find({
            'user_id': user_id,
            'start_date': {'$lte': today},
            '$or': [
                {'end_date': None},
                {'end_date': ''},
                {'end_date': {'$gte': today}}
            ],
            '$or': [
                {'frequency': 'daily'},
                {'$and': [
                    {'frequency': 'specific_days'},
                    {'days_of_week': sunday_based_day}
                ]}
            ]
        }))