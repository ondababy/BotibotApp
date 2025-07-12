# Botibot Schedule System

This document explains the schedule system implementation for the Botibot mobile application.

## Features

### Server-Side Features
- **User Authentication**: Token-based authentication for all schedule operations
- **Schedule Management**: Create, read, update, and delete medication schedules
- **Medication Logging**: Track when medications are taken or skipped
- **Today's Schedules**: Get schedules specifically for the current day
- **Data Validation**: Comprehensive validation for all inputs

### Client-Side Features
- **Dashboard**: Overview of today's medications with quick actions
- **Add Schedule**: Form to create new medication schedules
- **Schedule List**: View all schedules with edit/delete options
- **Medication Logging**: Mark medications as taken or skipped
- **Real-time Updates**: Automatic refresh after actions

## API Endpoints

### Schedule Management
- `POST /api/schedule` - Create a new schedule
- `GET /api/schedule` - Get all user schedules
- `GET /api/schedule/today` - Get today's schedules
- `GET /api/schedule/:id` - Get specific schedule
- `PUT /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule

### Medication Logging
- `POST /api/medication/log` - Log medication as taken/skipped
- `GET /api/medication/logs` - Get all medication logs
- `GET /api/medication/logs/:schedule_id` - Get logs for specific schedule

## Data Structure

### Schedule Object
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "medication_name": "string",
  "dosage": "string",
  "frequency": "daily|specific_days",
  "times": ["HH:MM", "HH:MM"],
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "days_of_week": [0, 1, 2, 3, 4, 5, 6],
  "notes": "string",
  "reminder_enabled": "boolean",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Medication Log Object
```json
{
  "_id": "ObjectId",
  "schedule_id": "ObjectId",
  "status": "taken|skipped",
  "taken_at": "datetime",
  "notes": "string",
  "created_at": "datetime"
}
```

## Usage

### 1. Creating a Schedule
Navigate to "Add Schedule" from the dashboard or schedule list. Fill in:
- Medication name (required)
- Dosage (required) 
- Frequency (daily or specific days)
- Times when medication should be taken
- Start and end dates
- Days of the week (if specific days)
- Optional notes

### 2. Viewing Schedules
- **Dashboard**: Shows today's medications with quick action buttons
- **Schedule List**: Shows all schedules with full details and management options

### 3. Logging Medications
From the dashboard or schedule list, tap:
- **Taken**: Mark medication as successfully taken
- **Skip**: Mark medication as skipped

### 4. Managing Schedules
From the schedule list:
- **Edit**: Modify existing schedule details
- **Delete**: Remove schedule permanently

## Validation Rules

### Server-Side Validation
- Medication name: Minimum 2 characters
- Dosage: Required field
- Times: Valid HH:MM format (24-hour)
- Dates: Valid YYYY-MM-DD format
- Days of week: Integers 0-6 (0=Sunday)
- Frequency: Must be "daily" or "specific_days"

### Client-Side Validation
- Real-time validation with error messages
- Time format validation
- Date range validation
- Required field checking

## Error Handling

### Server Errors
- 400: Bad Request (validation errors)
- 404: Not Found (schedule doesn't exist or doesn't belong to user)
- 500: Internal Server Error

### Client Errors
- Network timeout (10 seconds)
- Authentication token issues
- Validation errors displayed inline

## Dependencies

### Server (Python)
- Flask
- PyMongo
- datetime
- bson

### Client (React Native)
- axios (HTTP requests)
- AsyncStorage (token storage)
- expo-router (navigation)
- @react-native-community/datetimepicker
- @expo/vector-icons

## Installation & Setup

1. **Server Setup**:
   ```bash
   cd server
   pip install -r requirements.txt
   python main.py
   ```

2. **Client Setup**:
   ```bash
   cd client
   npm install
   expo start
   ```

3. **Database Setup**:
   - Ensure MongoDB is running
   - Update connection string in `server/app/utils/db_connection.py`

## File Structure

```
client/
├── app/
│   ├── Screen/
│   │   ├── Dashboard.js          # Today's medications overview
│   │   ├── AddSchedule.js        # Create new schedule
│   │   └── ScheduleList.js       # All schedules management
│   ├── Services/
│   │   └── scheduleApi.js        # API communication service
│   └── Utils/
│       └── scheduleValidation.js # Validation utilities

server/
├── app/
│   ├── models/
│   │   └── schedule_model.py     # Database operations
│   ├── controllers/
│   │   └── schedule_controller.py # Business logic
│   └── routes/
│       └── schedule_routes.py    # API endpoints
```

## Future Enhancements

1. **Push Notifications**: Remind users when it's time to take medication
2. **Medication History**: Track long-term adherence patterns
3. **Doctor Reports**: Generate reports for healthcare providers
4. **Medication Interactions**: Check for drug interactions
5. **Inventory Tracking**: Track medication supply levels
6. **Family Sharing**: Allow caregivers to monitor medications

## Troubleshooting

### Common Issues

1. **"Failed to create schedule"**:
   - Check network connection
   - Verify authentication token
   - Validate input format

2. **"Schedule not found"**:
   - Ensure schedule belongs to current user
   - Check if schedule was deleted

3. **Date/Time Issues**:
   - Verify time format (HH:MM)
   - Check date format (YYYY-MM-DD)
   - Ensure end date is after start date

For more help, check the console logs or contact support.
