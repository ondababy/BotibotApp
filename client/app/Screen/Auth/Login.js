import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
  Alert
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { router } from 'expo-router'
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import baseURL from '../../../assets/common/baseUrl'

const { width, height } = Dimensions.get('window')

// Responsive scaling functions
const scale = (size) => (width / 375) * size
const verticalScale = (size) => (height / 812) * size
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Check if user credentials are stored
    const checkStoredCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail')
        const savedRememberMe = await AsyncStorage.getItem('rememberMe')
        
        if (savedEmail && savedRememberMe === 'true') {
          setFormData(prev => ({ ...prev, email: savedEmail }))
          setRememberMe(true)
        }
      } catch (error) {
        console.log('Error loading stored credentials:', error)
      }
    }
    
    checkStoredCredentials()
  }, [])

  const handleLogin = async () => {
    // Validate form
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      // Make API request to login
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      })
      
      // Store auth token
      await AsyncStorage.setItem('jwt', response.data.token)
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', formData.email)
        await AsyncStorage.setItem('rememberMe', 'true')
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        await AsyncStorage.removeItem('userEmail')
        await AsyncStorage.removeItem('rememberMe')
      }
      
      // Navigate to main screen
      router.push('/Screen/Main')
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.'
      
      if (axios.isAxiosError(error)) {
        // Network error (server unreachable)
        if (!error.response) {
          errorMessage = 'Network error. Please check your internet connection.'
        } 
        // Server responded with error
        else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      Alert.alert('Login Failed', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSocialLogin = (provider) => {
    Alert.alert('Not Implemented', `${provider} login is not yet implemented`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4a6fa5', '#3d5a8a']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={moderateScale(20)} color="#f5f1e8" />
              </TouchableOpacity>
            </View>

            {/* Logo Section */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={1000}
              style={styles.logoSection}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <MaterialCommunityIcons name="pill" size={moderateScale(40)} color="#4a6fa5" />
                </View>
              </View>
              <Text style={styles.brandName}>Botibot</Text>
              <Text style={styles.tagline}>Welcome back!</Text>
            </Animatable.View>

            {/* Login Card */}
            <Animated.View 
              style={[
                styles.loginCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <Animatable.View animation="fadeIn" delay={300}>
                <Text style={styles.cardTitle}>Sign In</Text>
                <Text style={styles.cardSubtitle}>Please login to your account</Text>
              </Animatable.View>

              {/* Email Input */}
              <Animatable.View 
                animation="fadeInLeft" 
                delay={400}
                style={styles.inputWrapper}
              >
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="mail-outline" size={moderateScale(18)} color="#4a6fa5" />
                  </View>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Email Address"
                    placeholderTextColor="#a0aec0"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Animatable.Text animation="shake" style={styles.errorText}>
                    {errors.email}
                  </Animatable.Text>
                )}
              </Animatable.View>

              {/* Password Input */}
              <Animatable.View 
                animation="fadeInLeft" 
                delay={500}
                style={styles.inputWrapper}
              >
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="lock-closed-outline" size={moderateScale(18)} color="#4a6fa5" />
                  </View>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Password"
                    placeholderTextColor="#a0aec0"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={moderateScale(18)} 
                      color="#4a6fa5" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Animatable.Text animation="shake" style={styles.errorText}>
                    {errors.password}
                  </Animatable.Text>
                )}
              </Animatable.View>

              {/* Remember Me & Forgot Password */}
              <Animatable.View 
                animation="fadeInUp" 
                delay={600}
                style={styles.optionsRow}
              >
                <View style={styles.rememberMe}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: '#e2e8f0', true: '#4a6fa5' }}
                    thumbColor={rememberMe ? '#f5f1e8' : '#f4f4f4'}
                    ios_backgroundColor="#e2e8f0"
                    style={styles.switch}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/Screen/Auth/ForgotPassword')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Animatable.View>

              {/* Login Button */}
              <Animatable.View animation="fadeInUp" delay={700}>
                <TouchableOpacity 
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animatable.View 
                        animation="rotate" 
                        iterationCount="infinite" 
                        duration={1000}
                      >
                        <Ionicons name="refresh" size={moderateScale(18)} color="#f5f1e8" />
                      </Animatable.View>
                      <Text style={styles.loginButtonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </Animatable.View>

              {/* Divider */}
              <Animatable.View 
                animation="fadeIn" 
                delay={800}
                style={styles.dividerContainer}
              >
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </Animatable.View>

              {/* Social Login */}
              <Animatable.View animation="fadeInUp" delay={900}>
                <Text style={styles.socialTitle}>Sign in with</Text>
                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialLogin('Google')}
                  >
                    <FontAwesome5 name="google" size={moderateScale(16)} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={() => handleSocialLogin('Facebook')}
                  >
                    <FontAwesome5 name="facebook-f" size={moderateScale(16)} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('Apple')}
                  >
                    <FontAwesome5 name="apple" size={moderateScale(16)} color="#000000" />
                  </TouchableOpacity>
                </View>
              </Animatable.View>

              {/* Register Link */}
              <Animatable.View 
                animation="fadeIn" 
                delay={1000}
                style={styles.registerContainer}
              >
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/Screen/Auth/Register')}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(30),
    marginBottom: verticalScale(15),
  },
  backButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(245, 241, 232, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoContainer: {
    marginBottom: verticalScale(12),
  },
  logoWrapper: {
    width: moderateScale(80),
    height: moderateScale(80),
    backgroundColor: '#f5f1e8',
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  brandName: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#f5f1e8',
    letterSpacing: 0.8,
    fontFamily: 'Poppins-ExtraBold',
    marginBottom: verticalScale(2),
  },
  tagline: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.9)',
    fontFamily: 'Poppins-Regular',
  },
  loginCard: {
    backgroundColor: '#f5f1e8',
    borderRadius: moderateScale(25),
    padding: moderateScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#4a6fa5',
    fontFamily: 'Poppins-Bold',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: moderateScale(13),
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  inputWrapper: {
    marginBottom: verticalScale(16),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(74, 111, 165, 0.2)',
    overflow: 'hidden',
  },
  inputIcon: {
    width: moderateScale(44),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 111, 165, 0.08)',
  },
  input: {
    flex: 1,
    height: verticalScale(48),
    paddingHorizontal: moderateScale(14),
    fontSize: moderateScale(15),
    color: '#2d3748',
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  eyeIcon: {
    padding: moderateScale(12),
  },
  errorText: {
    fontSize: moderateScale(11),
    color: '#e53e3e',
    marginTop: verticalScale(4),
    marginLeft: moderateScale(12),
    fontFamily: 'Poppins-Regular',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  rememberText: {
    fontSize: moderateScale(13),
    color: '#4a6fa5',
    marginLeft: moderateScale(6),
    fontFamily: 'Poppins-Regular',
  },
  forgotText: {
    fontSize: moderateScale(13),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#4a6fa5',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    shadowColor: '#4a6fa5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#f5f1e8',
    fontSize: moderateScale(16),
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: moderateScale(8),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(74, 111, 165, 0.2)',
  },
  dividerText: {
    fontSize: moderateScale(11),
    color: '#6b7280',
    marginHorizontal: moderateScale(14),
    fontFamily: 'Poppins-Regular',
  },
  socialTitle: {
    fontSize: moderateScale(13),
    color: '#4a6fa5',
    textAlign: 'center',
    marginBottom: verticalScale(12),
    fontFamily: 'Poppins-Regular',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(14),
    marginBottom: verticalScale(20),
  },
  socialButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 111, 165, 0.1)',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: moderateScale(13),
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    fontSize: moderateScale(13),
    color: '#4a6fa5',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
})