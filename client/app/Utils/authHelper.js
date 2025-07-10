import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from '../../assets/common/baseUrl'

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to attach token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle token expiration/unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // You could implement token refresh logic here
        // For now, we'll just log the user out on 401
        await AsyncStorage.removeItem('jwt')
        await AsyncStorage.removeItem('user')
        
        // Force app to return to login screen
        // You'll need to implement this navigation logic
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api