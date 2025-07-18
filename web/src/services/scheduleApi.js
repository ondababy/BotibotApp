// Mock schedule service for web version
export const scheduleService = {
  createSchedule: async (payload) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Creating schedule:', payload);
        resolve({
          success: true,
          message: 'Medication schedule created successfully!'
        });
      }, 1000);
    });
  },

  getSchedules: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: []
        });
      }, 500);
    });
  },

  updateSchedule: async (id, payload) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Updating schedule:', id, payload);
        resolve({
          success: true,
          message: 'Medication schedule updated successfully!'
        });
      }, 1000);
    });
  },

  deleteSchedule: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleting schedule:', id);
        resolve({
          success: true,
          message: 'Medication schedule deleted successfully!'
        });
      }, 500);
    });
  }
};
