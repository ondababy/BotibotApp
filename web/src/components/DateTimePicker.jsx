import React from 'react';

const DateTimePicker = ({ 
  value, 
  onChange, 
  mode = 'date', 
  minimumDate = null,
  style = {} 
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    let date;
    
    if (mode === 'time') {
      date = new Date();
      const [hours, minutes] = newValue.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
    } else {
      date = new Date(newValue);
    }
    
    onChange({ target: { value: newValue } }, date);
  };

  const formatValue = () => {
    if (!value) return '';
    
    if (mode === 'time') {
      return value.toTimeString().slice(0, 5);
    } else {
      return value.toISOString().split('T')[0];
    }
  };

  const inputStyles = {
    padding: '12px 16px',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    ...style
  };

  const getMinDate = () => {
    if (!minimumDate) return undefined;
    return minimumDate.toISOString().split('T')[0];
  };

  return (
    <input
      type={mode}
      value={formatValue()}
      onChange={handleChange}
      style={inputStyles}
      min={mode === 'date' ? getMinDate() : undefined}
    />
  );
};

export default DateTimePicker;
