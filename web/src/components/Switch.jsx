import React from 'react';

const Switch = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  size = 'medium'
}) => {
  const sizeConfig = {
    small: { width: 36, height: 20, thumbSize: 16 },
    medium: { width: 44, height: 24, thumbSize: 20 },
    large: { width: 52, height: 28, thumbSize: 24 }
  };

  const { width, height, thumbSize } = sizeConfig[size];

  const trackStyles = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: checked ? '#4a6fa5' : '#e0e0e0',
    borderRadius: `${height / 2}px`,
    position: 'relative',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease',
    opacity: disabled ? 0.6 : 1
  };

  const thumbStyles = {
    width: `${thumbSize}px`,
    height: `${thumbSize}px`,
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    left: checked ? `${width - thumbSize - 2}px` : '2px',
    transform: 'translateY(-50%)',
    transition: 'left 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div style={trackStyles} onClick={handleClick}>
      <div style={thumbStyles}></div>
    </div>
  );
};

export default Switch;
