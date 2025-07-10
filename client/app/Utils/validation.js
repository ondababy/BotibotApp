// utils/validation.js
export const validateForm = (formData) => {
  const errors = {}

  // Required field validation
  if (!formData.firstName?.trim()) errors.firstName = 'First name is required'
  if (!formData.lastName?.trim()) errors.lastName = 'Last name is required'
  if (!formData.age?.trim()) errors.age = 'Age is required'
  if (!formData.address?.trim()) errors.address = 'Address is required'
  if (!formData.email?.trim()) errors.email = 'Email is required'
  if (!formData.contactNumber?.trim()) errors.contactNumber = 'Contact number is required'
  if (!formData.emergencyContactName?.trim()) errors.emergencyContactName = 'Emergency contact name is required'
  if (!formData.emergencyContactNumber?.trim()) errors.emergencyContactNumber = 'Emergency contact number is required'

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validations
  if (!formData.password?.trim()) errors.password = 'Password is required'

  // Password strength validation
  if (formData.password && formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  
  // Confirm password validation
  if (!formData.confirmPassword?.trim()) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  // Age validation
  const ageNum = parseInt(formData.age)
  if (formData.age && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
    errors.age = 'Please enter a valid age (1-120)'
  }

  // Phone number validation (Philippines format - 11 digits)
  const phoneRegex = /^(?:\+63|0)?\d{10,11}$/
  
  if (formData.contactNumber && !phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
    errors.contactNumber = 'Please enter a valid 11-digit phone number'
  }
  
  if (formData.emergencyContactNumber && !phoneRegex.test(formData.emergencyContactNumber.replace(/\s/g, ''))) {
    errors.emergencyContactNumber = 'Please enter a valid 11-digit phone number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateField = (fieldName, value, allFormData = {}) => {
  const tempFormData = { ...allFormData, [fieldName]: value }
  const { errors } = validateForm(tempFormData)
  return errors[fieldName] || null
}