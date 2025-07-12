from flask import request, jsonify
from app.models.schedule_model import Schedule
from app.utils.auth import token_required
from datetime import datetime, time
from bson.objectid import ObjectId
import json
import re

def validate_time_format(time_str):
    """Validate time format (HH:MM)"""
    pattern = r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    return bool(re.match(pattern, time_str))

def validate_date_format(date_str):
    """Validate date format (YYYY-MM-DD)"""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

@token_required
def create_schedule(current_user):
    """Create a new medication schedule"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['medication_name', 'dosage', 'frequency', 'times']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Validate medication name
        if len(data['medication_name'].strip()) < 2:
            return jsonify({'message': 'Medication name must be at least 2 characters long'}), 400
        
        # Validate dosage
        if len(data['dosage'].strip()) < 1:
            return jsonify({'message': 'Dosage is required'}), 400
        
        # Validate frequency
        if data['frequency'] not in ['daily', 'specific_days']:
            return jsonify({'message': 'Frequency must be either "daily" or "specific_days"'}), 400
        
        # Validate times
        if not isinstance(data['times'], list) or len(data['times']) == 0:
            return jsonify({'message': 'At least one time is required'}), 400
        
        for time_str in data['times']:
            if not validate_time_format(time_str):
                return jsonify({'message': f'Invalid time format: {time_str}. Use HH:MM format'}), 400
        
        # Validate start_date
        start_date = data.get('start_date', datetime.now().strftime('%Y-%m-%d'))
        if not validate_date_format(start_date):
            return jsonify({'message': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        # Validate end_date if provided
        end_date = data.get('end_date')
        if end_date and not validate_date_format(end_date):
            return jsonify({'message': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Validate days_of_week for specific_days frequency
        if data['frequency'] == 'specific_days':
            days_of_week = data.get('days_of_week', [])
            if not isinstance(days_of_week, list) or len(days_of_week) == 0:
                return jsonify({'message': 'Days of week are required for specific_days frequency'}), 400
            
            for day in days_of_week:
                if not isinstance(day, int) or day < 0 or day > 6:
                    return jsonify({'message': 'Invalid day of week. Use integers 0-6 (0=Sunday)'}), 400
        
        # Prepare schedule data
        schedule_data = {
            'user_id': current_user['_id'],
            'medication_name': data['medication_name'].strip(),
            'dosage': data['dosage'].strip(),
            'frequency': data['frequency'],
            'times': data['times'],
            'start_date': start_date,
            'end_date': end_date,
            'days_of_week': data.get('days_of_week', [0, 1, 2, 3, 4, 5, 6] if data['frequency'] == 'daily' else []),
            'notes': data.get('notes', '').strip(),
            'reminder_enabled': data.get('reminder_enabled', True),
            'is_active': True
        }
        
        # Create schedule
        schedule_id = Schedule.create_schedule(schedule_data)
        
        # Get the created schedule
        new_schedule = Schedule.find_by_id(schedule_id)
        if new_schedule:
            new_schedule['_id'] = str(new_schedule['_id'])
            new_schedule['user_id'] = str(new_schedule['user_id'])
        
        return jsonify({
            'message': 'Medication schedule created successfully',
            'schedule': new_schedule
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Error creating schedule: {str(e)}'}), 500

@token_required
def get_all_schedules(current_user):
    """Get all medication schedules for a user"""
    schedules = Schedule.find_by_user(current_user['_id'])
    
    # Convert ObjectId to string for JSON serialization
    for schedule in schedules:
        schedule['_id'] = str(schedule['_id'])
        schedule['user_id'] = str(schedule['user_id'])
    
    return jsonify({
        'schedules': schedules
    }), 200

@token_required
def get_schedule(current_user, schedule_id):
    """Get a specific schedule by ID"""
    try:
        schedule = Schedule.find_by_id(schedule_id)
        
        # Check if schedule exists and belongs to user
        if not schedule or str(schedule['user_id']) != str(current_user['_id']):
            return jsonify({'message': 'Schedule not found'}), 404
        
        # Convert ObjectId to string for JSON serialization
        schedule['_id'] = str(schedule['_id'])
        schedule['user_id'] = str(schedule['user_id'])
        
        return jsonify({'schedule': schedule}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400

@token_required
def update_schedule(current_user, schedule_id):
    """Update an existing schedule"""
    try:
        # Check if schedule exists and belongs to user
        schedule = Schedule.find_by_id(schedule_id)
        if not schedule or str(schedule['user_id']) != str(current_user['_id']):
            return jsonify({'message': 'Schedule not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        update_data = {}
        fields = [
            'medication_name', 'dosage', 'frequency', 'times', 
            'start_date', 'end_date', 'days_of_week', 'notes', 'reminder_enabled'
        ]
        
        for field in fields:
            if field in data:
                update_data[field] = data[field]
        
        Schedule.update_schedule(schedule_id, update_data)
        
        # Get updated schedule
        updated_schedule = Schedule.find_by_id(schedule_id)
        updated_schedule['_id'] = str(updated_schedule['_id'])
        updated_schedule['user_id'] = str(updated_schedule['user_id'])
        
        return jsonify({
            'message': 'Schedule updated successfully',
            'schedule': updated_schedule
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400

@token_required
def delete_schedule(current_user, schedule_id):
    """Delete a schedule"""
    try:
        # Check if schedule exists and belongs to user
        schedule = Schedule.find_by_id(schedule_id)
        if not schedule or str(schedule['user_id']) != str(current_user['_id']):
            return jsonify({'message': 'Schedule not found'}), 404
        
        Schedule.delete_schedule(schedule_id)
        
        return jsonify({'message': 'Schedule deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400

@token_required
def log_medication(current_user):
    """Log a medication as taken or skipped"""
    data = request.get_json()
    
    if not all(k in data for k in ['schedule_id', 'status', 'taken_at']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        # Check if schedule exists and belongs to user
        schedule = Schedule.find_by_id(data['schedule_id'])
        if not schedule or str(schedule['user_id']) != str(current_user['_id']):
            return jsonify({'message': 'Schedule not found'}), 404
        
        # Create a new log entry
        log_data = {
            'schedule_id': ObjectId(data['schedule_id']),
            'status': data['status'],  # 'taken' or 'skipped'
            'taken_at': data['taken_at'],
            'notes': data.get('notes', '')
        }
        
        log_id = Schedule.create_log(log_data)
        
        return jsonify({
            'message': f'Medication {data["status"]} successfully',
            'log_id': str(log_id)
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400

@token_required
def get_medication_logs(current_user, schedule_id=None):
    """Get medication logs for a user, optionally filtered by schedule_id"""
    try:
        if schedule_id:
            # Check if schedule exists and belongs to user
            schedule = Schedule.find_by_id(schedule_id)
            if not schedule or str(schedule['user_id']) != str(current_user['_id']):
                return jsonify({'message': 'Schedule not found'}), 404
            
            logs = Schedule.get_logs_by_schedule(schedule_id)
        else:
            logs = Schedule.get_logs_by_user(current_user['_id'])
        
        # Convert ObjectIds to strings for JSON serialization
        for log in logs:
            log['_id'] = str(log['_id'])
            log['schedule_id'] = str(log['schedule_id'])
        
        return jsonify({
            'logs': logs
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400

@token_required
def get_today_schedules(current_user):
    """Get medication schedules for today"""
    try:
        schedules = Schedule.get_schedules_for_today(current_user['_id'])
        
        # Convert ObjectId to string for JSON serialization
        for schedule in schedules:
            schedule['_id'] = str(schedule['_id'])
            schedule['user_id'] = str(schedule['user_id'])
        
        return jsonify({
            'schedules': schedules,
            'count': len(schedules)
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400