import re
from email_validator import validate_email, EmailNotValidError

def validate_registration_data(data):
    """Validate user registration data"""
    errors = {}
    
    # Required fields
    required_fields = [
        'firstName', 'lastName', 'age', 'address', 
        'email', 'password', 'contactNumber', 
        'emergencyContactName', 'emergencyContactNumber'
    ]
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} is required"
    
    # Email validation
    if 'email' in data and data['email']:
        try:
            validate_email(data['email'])
        except EmailNotValidError:
            errors['email'] = "Invalid email format"
    
    # Password strength validation
    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            errors['password'] = "Password must be at least 8 characters long"
        elif not re.search(r'[a-z]', data['password']):
            errors['password'] = "Password must contain at least one lowercase letter"

    
    # Age validation
    if 'age' in data and data['age']:
        try:
            age = int(data['age'])
            if age < 18 or age > 120:
                errors['age'] = "Age must be between 18 and 120"
        except ValueError:
            errors['age'] = "Age must be a number"
    
    # Phone number validation
    if 'contactNumber' in data and data['contactNumber']:
        if not re.match(r'^\d{10,15}$', re.sub(r'[\s\-\(\)]', '', data['contactNumber'])):
            errors['contactNumber'] = "Invalid phone number format"
    
    if 'emergencyContactNumber' in data and data['emergencyContactNumber']:
        if not re.match(r'^\d{10,15}$', re.sub(r'[\s\-\(\)]', '', data['emergencyContactNumber'])):
            errors['emergencyContactNumber'] = "Invalid emergency contact number format"
    
    return errors

def validate_login_data(data):
    """Validate user login data"""
    errors = {}
    
    # Required fields
    if 'email' not in data or not data['email']:
        errors['email'] = "Email is required"
    
    if 'password' not in data or not data['password']:
        errors['password'] = "Password is required"
    
    # Email format validation
    if 'email' in data and data['email']:
        try:
            validate_email(data['email'])
        except EmailNotValidError:
            errors['email'] = "Invalid email format"
    
    return errors