import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '../../assets/common/baseUrl';

// Create an axios instance for face recognition API
const faceAPI = axios.create({
  baseURL: `${baseUrl}/api/face`,
  timeout: 30000, // 30 seconds timeout for image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
faceAPI.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Using token: ${token.substring(0, 20)}...`); // Debug log
      } else {
        console.log('No JWT token found in storage');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
faceAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be invalid, redirect to login
      // You can handle this globally here
      console.warn('Authentication failed, token might be invalid');
    }
    return Promise.reject(error);
  }
);

export const faceRecognitionService = {
  /**
   * Register face samples for the current user
   * @param {Array<string>} images - Array of base64 encoded images
   * @returns {Promise} API response
   */
  registerFace: async (images) => {
    try {
      console.log(`Making face registration request to: ${faceAPI.defaults.baseURL}/register`);
      console.log(`Number of images: ${images.length}`);
      
      const response = await faceAPI.post('/register', { images });
      console.log('Face registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Face registration error details:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  /**
   * Recognize a face from an image
   * @param {string} image - Base64 encoded image
   * @returns {Promise} API response
   */
  recognizeFace: async (image) => {
    try {
      console.log(`Making face recognition request to: ${faceAPI.defaults.baseURL}/recognize`);
      const response = await faceAPI.post('/recognize', { image });
      console.log('Face recognition response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Face recognition error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  /**
   * Check if the current user has registered face data
   * @returns {Promise} API response
   */
  getFaceStatus: async () => {
    try {
      const response = await faceAPI.get('/status');
      return response.data;
    } catch (error) {
      console.error('Face status error:', error);
      throw error;
    }
  },

  /**
   * Delete face data for the current user
   * @returns {Promise} API response
   */
  deleteFaceData: async () => {
    try {
      const response = await faceAPI.delete('/delete');
      return response.data;
    } catch (error) {
      console.error('Delete face data error:', error);
      throw error;
    }
  },
};

export default faceRecognitionService;
