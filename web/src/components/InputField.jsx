import React from 'react';

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  multiline = false, 
  numberOfLines = 1,
  style = {},
  icon,
  type = 'text'
}) => {
  const handleChange = (e) => {
    onChangeText(e.target.value);
  };

  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${error ? '#e74c3c' : '#e9ecef'}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? `${numberOfLines * 24 + 24}px` : 'auto',
    ...style
  };

  const containerStyles = {
    marginBottom: '16px',
    width: '100%'
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50'
  };

  const inputContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start'
  };

  const iconStyles = {
    position: 'absolute',
    left: '12px',
    top: multiline ? '14px' : '50%',
    transform: multiline ? 'none' : 'translateY(-50%)',
    zIndex: 1
  };

  const errorStyles = {
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '4px'
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputContainerStyles}>
        {icon && <div style={iconStyles}>{icon}</div>}
        {multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            style={{
              ...inputStyles,
              paddingLeft: icon ? '44px' : '16px'
            }}
            rows={numberOfLines}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            style={{
              ...inputStyles,
              paddingLeft: icon ? '44px' : '16px'
            }}
          />
        )}
      </div>
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export default InputField;
