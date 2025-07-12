import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../../assets/common/baseUrl';

// Create axios instance with base configuration
const scheduleApi = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

// Add request interceptor to include auth token
scheduleApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
scheduleApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Schedule API functions
export const scheduleService = {
  // Create a new schedule
  createSchedule: async (scheduleData) => {
    try {
      const response = await scheduleApi.post('/schedule', scheduleData);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create schedule',
        error: error.response?.data || error.message
      };
    }
  },

  // Get all schedules for the user
  getAllSchedules: async () => {
    try {
      const response = await scheduleApi.get('/schedule');
      return {
        success: true,
        data: response.data.schedules,
        message: 'Schedules fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch schedules',
        error: error.response?.data || error.message
      };
    }
  },

  // Get today's schedules
  getTodaySchedules: async () => {
    try {
      const response = await scheduleApi.get('/schedule/today');
      return {
        success: true,
        data: response.data.schedules,
        count: response.data.count,
        message: 'Today\'s schedules fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch today\'s schedules',
        error: error.response?.data || error.message
      };
    }
  },

  // Get a specific schedule by ID
  getSchedule: async (scheduleId) => {
    try {
      const response = await scheduleApi.get(`/schedule/${scheduleId}`);
      return {
        success: true,
        data: response.data.schedule,
        message: 'Schedule fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch schedule',
        error: error.response?.data || error.message
      };
    }
  },

  // Update a schedule
  updateSchedule: async (scheduleId, updateData) => {
    try {
      const response = await scheduleApi.put(`/schedule/${scheduleId}`, updateData);
      return {
        success: true,
        data: response.data.schedule,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update schedule',
        error: error.response?.data || error.message
      };
    }
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await scheduleApi.delete(`/schedule/${scheduleId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete schedule',
        error: error.response?.data || error.message
      };
    }
  },

  // Log medication as taken or skipped
  logMedication: async (logData) => {
    try {
      const response = await scheduleApi.post('/medication/log', logData);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to log medication',
        error: error.response?.data || error.message
      };
    }
  },

  // Get medication logs
  getMedicationLogs: async (scheduleId = null) => {
    try {
      const url = scheduleId ? `/medication/logs/${scheduleId}` : '/medication/logs';
      const response = await scheduleApi.get(url);
      return {
        success: true,
        data: response.data.logs,
        message: 'Medication logs fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medication logs',
        error: error.response?.data || error.message
      };
    }
  }
};

export default scheduleService;
