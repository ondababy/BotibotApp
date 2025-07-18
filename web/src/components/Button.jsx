import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  icon = null,
  loading = false,
  style = {}
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  const variantStyles = {
    primary: {
      background: disabled ? '#a8c0d6' : 'linear-gradient(135deg, #4a6fa5, #38598b)',
      color: '#fff',
      boxShadow: disabled ? 'none' : '0 4px 12px rgba(74, 111, 165, 0.3)'
    },
    secondary: {
      background: '#f8f9fa',
      color: '#4a6fa5',
      border: '1px solid #e9ecef'
    },
    danger: {
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      color: '#fff'
    }
  };

  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '12px'
    },
    medium: {
      padding: '12px 24px',
      fontSize: '14px'
    },
    large: {
      padding: '16px 32px',
      fontSize: '16px'
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    opacity: disabled ? 0.7 : 1,
    ...style
  };

  const loadingSpinnerStyles = {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        style={buttonStyles}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <div style={loadingSpinnerStyles}></div>
        ) : (
          icon && <span>{icon}</span>
        )}
        {loading ? 'Loading...' : children}
      </button>
    </>
  );
};

export default Button;
