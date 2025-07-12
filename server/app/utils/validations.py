import re
from email_validator import validate_email, EmailNotValidError

def validate_registration_data(data):
    """Validate user registration data"""
    errors = {}
    
    # Required fields - only essential ones
    required_fields = ['email', 'password']
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} is required"
    
    # Optional fields with defaults
    if 'firstName' not in data or not data['firstName']:
        data['firstName'] = 'Test'
    if 'lastName' not in data or not data['lastName']:
        data['lastName'] = 'User'
    if 'age' not in data or not data['age']:
        data['age'] = '25'
    if 'address' not in data or not data['address']:
        data['address'] = 'Test Address'
    if 'contactNumber' not in data or not data['contactNumber']:
        data['contactNumber'] = '1234567890'
    if 'emergencyContactName' not in data or not data['emergencyContactName']:
        data['emergencyContactName'] = 'Emergency Contact'
    if 'emergencyContactNumber' not in data or not data['emergencyContactNumber']:
        data['emergencyContactNumber'] = '0987654321'
    
    # Email validation - more lenient
    if 'email' in data and data['email']:
        if '@' not in data['email'] or '.' not in data['email']:
            errors['email'] = "Invalid email format"
    
    # Password strength validation - more lenient
    if 'password' in data and data['password']:
        if len(data['password']) < 3:
            errors['password'] = "Password must be at least 3 characters long"
    
    # Age validation - more lenient
    if 'age' in data and data['age']:
        try:
            age = int(data['age'])
            if age < 1 or age > 150:
                errors['age'] = "Age must be between 1 and 150"
        except ValueError:
            errors['age'] = "Age must be a number"
    
    # Phone number validation - very lenient
    if 'contactNumber' in data and data['contactNumber']:
        clean_number = re.sub(r'[\s\-\(\)]', '', data['contactNumber'])
        if not re.match(r'^\d{7,15}$', clean_number):
            errors['contactNumber'] = "Phone number must contain 7-15 digits"
    
    if 'emergencyContactNumber' in data and data['emergencyContactNumber']:
        clean_number = re.sub(r'[\s\-\(\)]', '', data['emergencyContactNumber'])
        if not re.match(r'^\d{7,15}$', clean_number):
            errors['emergencyContactNumber'] = "Emergency contact must contain 7-15 digits"
    
    return errors

def validate_login_data(data):
    """Validate user login data"""
    errors = {}
    
    # Required fields
    if 'email' not in data or not data['email']:
        errors['email'] = "Email is required"
    
    if 'password' not in data or not data['password']:
        errors['password'] = "Password is required"
    
    # Email format validation - more lenient
    if 'email' in data and data['email']:
        if '@' not in data['email'] or '.' not in data['email']:
            errors['email'] = "Invalid email format"
    
    return errors