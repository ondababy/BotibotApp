// Validation utilities for schedule forms

export const validateScheduleForm = (schedule) => {
  const errors = {};
  
  // Validate medication name
  if (!schedule.medication_name || !schedule.medication_name.trim()) {
    errors.medication_name = 'Medication name is required';
  } else if (schedule.medication_name.trim().length < 2) {
    errors.medication_name = 'Medication name must be at least 2 characters long';
  }
  
  // Validate dosage
  if (!schedule.dosage || !schedule.dosage.trim()) {
    errors.dosage = 'Dosage is required';
  }
  
  // Validate frequency
  if (!schedule.frequency || !['daily', 'specific_days'].includes(schedule.frequency)) {
    errors.frequency = 'Please select a valid frequency';
  }
  
  // Validate days of week for specific_days frequency
  if (schedule.frequency === 'specific_days' && (!schedule.days_of_week || schedule.days_of_week.length === 0)) {
    errors.days_of_week = 'Please select at least one day';
  }
  
  // Validate times
  if (!schedule.times || schedule.times.length === 0) {
    errors.times = 'At least one time is required';
  } else {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const time of schedule.times) {
      if (!timeRegex.test(time)) {
        errors.times = 'Invalid time format. Use HH:MM format (e.g., 08:30)';
        break;
      }
    }
  }
  
  // Validate date range
  if (schedule.start_date && schedule.end_date) {
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);
    
    if (endDate <= startDate) {
      errors.end_date = 'End date must be after start date';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTimeFormat = (timeString) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

export const validateDateFormat = (dateString) => {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  } catch (error) {
    return false;
  }
};

export const formatTimeForDisplay = (timeString) => {
  if (!timeString || !validateTimeFormat(timeString)) {
    return timeString;
  }
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
};

export const getDayShortName = (dayNumber) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayNumber] || '';
};
