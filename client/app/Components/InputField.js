import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity
} from 'react-native';
import { moderateScale, verticalScale } from '../Utils/metrics';

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  icon,
  rightIcon,
  error,
  onBlur,
  onFocus,
  delay = 0,
  maxLength,
  editable = true,
  style // Accept custom style prop
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedOpacity] = useState(new Animated.Value(0));
  const [animatedTranslateY] = useState(new Animated.Value(20));

  useEffect(() => {
    // Animate the field with a delay for staggered animation effect
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(animatedTranslateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const inputStyles = [
    styles.input,
    multiline && styles.multilineInput,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    !editable && styles.inputDisabled
  ];

  const containerStyles = [
    styles.container,
    isFocused && styles.containerFocused,
    error && styles.containerError
  ];

  return (
    <Animated.View
      style={[
        styles.fieldContainer,
        style, // Apply custom style
        {
          opacity: animatedOpacity,
          transform: [{ translateY: animatedTranslateY }]
        }
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyles}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          editable={editable}
        />
        
        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: verticalScale(12), // Reduced from 16
  },
  label: {
    fontSize: moderateScale(13), // Reduced from 14
    fontWeight: '500',
    color: '#4a6fa5',
    marginBottom: verticalScale(4), // Reduced from 6
    fontFamily: 'Poppins-Medium',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(6), // Smaller border radius
    backgroundColor: '#fff',
    overflow: 'hidden',
    minHeight: verticalScale(36), // Smaller minimum height
  },
  containerFocused: {
    borderColor: '#4a6fa5',
    shadowColor: '#4a6fa5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  containerError: {
    borderColor: '#e74c3c',
  },
  iconContainer: {
    paddingHorizontal: moderateScale(8), // Reduced from 10
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  rightIconContainer: {
    paddingRight: moderateScale(8), // Reduced from 10
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(8), // Further reduced for better responsiveness
    paddingHorizontal: moderateScale(6), // Reduced padding
    fontSize: moderateScale(12), // Smaller font for better fit
    color: '#333',
    fontFamily: 'Poppins-Regular',
    minHeight: verticalScale(36), // Smaller minimum height
    maxHeight: verticalScale(44), // Added max height for single line
  },
  multilineInput: {
    paddingTop: verticalScale(8), // Reduced padding
    textAlignVertical: 'top',
    minHeight: verticalScale(50), // Further reduced
    maxHeight: verticalScale(70), // Smaller max height
  },
  inputFocused: {
    color: '#000',
  },
  inputError: {
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#999',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: moderateScale(11), // Reduced from 12
    marginTop: verticalScale(3), // Reduced from 4
    fontFamily: 'Poppins-Regular',
  },
});

// Add default export to satisfy Expo Router requirements
const InputFieldExport = { InputField };
export default InputFieldExport;