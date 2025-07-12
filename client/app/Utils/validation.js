// utils/validation.js
export const validateForm = (formData) => {
  const errors = {}

  // Required field validation - only for essential fields
  if (!formData.email?.trim()) errors.email = 'Email is required'
  if (!formData.password?.trim()) errors.password = 'Password is required'

  // Optional fields - only validate if provided
  if (formData.firstName && !formData.firstName.trim()) errors.firstName = 'First name cannot be empty'
  if (formData.lastName && !formData.lastName.trim()) errors.lastName = 'Last name cannot be empty'

  // Email validation - more lenient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validation - more lenient
  if (formData.password && formData.password.length < 3) {
    errors.password = 'Password must be at least 3 characters'
  }
  
  // Confirm password validation - only if confirmPassword field exists
  if (formData.confirmPassword !== undefined) {
    if (!formData.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }

  // Age validation - more lenient
  if (formData.age) {
    const ageNum = parseInt(formData.age)
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      errors.age = 'Please enter a valid age'
    }
  }

  // Phone number validation - very lenient, accept any format
  if (formData.contactNumber) {
    const phoneClean = formData.contactNumber.replace(/\D/g, '') // Remove non-digits
    if (phoneClean.length < 7 || phoneClean.length > 15) {
      errors.contactNumber = 'Please enter a valid phone number'
    }
  }
  
  if (formData.emergencyContactNumber) {
    const phoneClean = formData.emergencyContactNumber.replace(/\D/g, '')
    if (phoneClean.length < 7 || phoneClean.length > 15) {
      errors.emergencyContactNumber = 'Please enter a valid phone number'
    }
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