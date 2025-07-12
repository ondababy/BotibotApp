// filepath: c:\Users\Adrian\Botibot-Mobile\client\app\Utils\dateUtils.js
/**
 * Formats a date string to a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a time string to a more readable format
 * @param {string} timeString - Time string in format HH:MM (24-hour)
 * @returns {string} Formatted time string (e.g., "8:00 AM")
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original string if parsing fails
  }
};

// Export a default object to satisfy Expo Router requirements
export default { formatDate, formatTime };