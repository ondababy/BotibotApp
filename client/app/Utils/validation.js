// utils/validation.js
export const validateForm = (formData) => {
  const errors = {}

  // Required field validation - only for essential fields
  if (!formData.email?.trim()) errors.email = 'Email is required'
  if (!formData.pinCode?.trim()) errors.pinCode = 'PIN code is required'

  // Optional fields - only validate if provided
  if (formData.firstName && !formData.firstName.trim()) errors.firstName = 'First name cannot be empty'
  if (formData.lastName && !formData.lastName.trim()) errors.lastName = 'Last name cannot be empty'

  // Email validation - more lenient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // PIN code validation
  if (formData.pinCode) {
    const pinRegex = /^[0-9]{4,6}$/
    if (!pinRegex.test(formData.pinCode)) {
      errors.pinCode = 'PIN must be 4-6 digits only'
    }
  }
  
  // Confirm PIN code validation - only if confirmPinCode field exists
  if (formData.confirmPinCode !== undefined) {
    if (!formData.confirmPinCode?.trim()) {
      errors.confirmPinCode = 'Please confirm your PIN code'
    } else if (formData.confirmPinCode !== formData.pinCode) {
      errors.confirmPinCode = 'PIN codes do not match'
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