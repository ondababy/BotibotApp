import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers for push notifications and returns the token
 */
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4a6fa5',
    });
  }

  return token;
}

/**
 * Schedules a notification for medication reminders
 * @param {Object} schedule - Medication schedule object
 * @returns {Promise<Array>} Array of notification IDs
 */
export async function scheduleMedicationReminders(schedule) {
  if (!schedule.reminder_enabled) {
    return [];
  }

  try {
    // Cancel existing notifications for this schedule
    const existingIds = await AsyncStorage.getItem(`reminders_${schedule.id}`);
    if (existingIds) {
      const ids = JSON.parse(existingIds);
      await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
    }

    const notificationIds = [];
    const times = Array.isArray(schedule.times) ? schedule.times : JSON.parse(schedule.times);
    const days = schedule.days_of_week && typeof schedule.days_of_week === 'string' 
      ? JSON.parse(schedule.days_of_week) 
      : schedule.days_of_week;

    // Set up the triggers based on frequency
    if (schedule.frequency === 'daily') {
      // Schedule daily reminders for each time
      for (const timeString of times) {
        const [hours, minutes] = timeString.split(':').map(Number);
        
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Medication Reminder',
            body: `Time to take ${schedule.medication_name} (${schedule.dosage})`,
            data: { scheduleId: schedule.id },
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
        
        notificationIds.push(id);
      }
    } else if (schedule.frequency === 'specific_days') {
      // Schedule reminders for specific days
      for (const day of days) {
        for (const timeString of times) {
          const [hours, minutes] = timeString.split(':').map(Number);
          
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Medication Reminder',
              body: `Time to take ${schedule.medication_name} (${schedule.dosage})`,
              data: { scheduleId: schedule.id },
            },
            trigger: {
              hour: hours,
              minute: minutes,
              weekday: day + 1, // Expo uses 1-7 for weekdays, we're using 0-6
              repeats: true,
            },
          });
          
          notificationIds.push(id);
        }
      }
    }

    // Save notification IDs for future reference
    await AsyncStorage.setItem(`reminders_${schedule.id}`, JSON.stringify(notificationIds));
    return notificationIds;
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return [];
  }
}

/**
 * Cancels all notifications for a specific schedule
 * @param {number} scheduleId - Schedule ID
 */
export async function cancelMedicationReminders(scheduleId) {
  try {
    const existingIds = await AsyncStorage.getItem(`reminders_${scheduleId}`);
    if (existingIds) {
      const ids = JSON.parse(existingIds);
      await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
      await AsyncStorage.removeItem(`reminders_${scheduleId}`);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}