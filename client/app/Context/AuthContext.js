import React, { createContext, useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import baseURL from '../../assets/common/baseUrl'
import { Alert } from 'react-native'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userToken, setUserToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const loadStoredAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt')
        const userData = await AsyncStorage.getItem('user')
        
        if (token) {
          setUserToken(token)
          setUserInfo(JSON.parse(userData))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.log('Error loading auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadStoredAuthState()
  }, [])

  // Login function
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${baseURL}/users/login`, {
        email,
        password
      })
      
      const { token, user } = response.data
      
      // Store user data
      await AsyncStorage.setItem('jwt', token)
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      setUserToken(token)
      setUserInfo(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.'
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${baseURL}/users/register`, userData)
      
      const { token, user } = response.data
      
      // Store user data
      await AsyncStorage.setItem('jwt', token)
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      setUserToken(token)
      setUserInfo(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.'
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('jwt')
      await AsyncStorage.removeItem('user')
      
      setUserToken(null)
      setUserInfo(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.log('Error during logout:', error)
      Alert.alert('Logout Error', 'An error occurred during logout')
    }
  }

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        userToken,
        userInfo,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)