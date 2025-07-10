// import axios from 'axios';
// import { Platform } from 'react-native';

// const baseUrl = '192.168.1.105';

// const getApiBaseUrl = () => {
//   // For iOS Simulator
//   if (__DEV__ && Platform.OS === 'ios') {
//     return 'http://localhost:5000/api/inventory';
//   }
  
//   // For Android Emulator
//   if (__DEV__ && Platform.OS === 'android') {
//     return 'http://10.0.2.2:5000/api/inventory';
//   }
  
//   // For physical devices (your mobile phone)
//   if (__DEV__) {
//     return `http://${baseUrl}:5000/api/inventory`;
//   }
  
//   // Production URL
//   return 'https://your-production-api.com/api/inventory';
// };

// const API_BASE_URL = getApiBaseUrl();

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
// });


// // Add request interceptor for authentication if needed
// api.interceptors.request.use(
//   (config) => {
//     // Add auth token if available
//     // const token = AsyncStorage.getItem('authToken');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error status
//       console.error('API Error:', error.response.data);
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('Network Error:', error.message);
//     } else {
//       // Something else happened
//       console.error('Error:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// export const pillService = {
//   // Get all pills
//   getAllPills: () => api.get('/pills'),
  
//   // Get pill by ID
//   getPillById: (id) => api.get(`/pills/${id}`),
  
//   // Add new pill
//   addPill: (pillData) => api.post('/pills', pillData),
  
//   // Update pill schedule
//   updateSchedule: (id, scheduleData) => api.put(`/pills/${id}/schedule`, scheduleData),
  
//   // Remove pill
//   removePill: (id, reason) => api.delete(`/pills/${id}`, { data: { reason } }),
  
//   // Refill pills
//   refillPills: (refillData) => api.post('/refill', refillData),
  
//   // Adjust inventory
//   adjustInventory: (adjustData) => api.post('/adjust', adjustData),
  
//   // Get low stock pills
//   getLowStockPills: () => api.get('/low-stock'),
  
//   // Get inventory summary
//   getInventorySummary: () => api.get('/summary'),
// };

// export default api;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const api = () => {
  return (
    <View>
      <Text>api</Text>
    </View>
  )
}

export default api

const styles = StyleSheet.create({})