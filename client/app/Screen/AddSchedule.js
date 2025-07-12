import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleService } from '../Services/scheduleApi';
import { InputField } from '../Components/InputField';
import { moderateScale, verticalScale } from '../Utils/metrics';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function AddSchedule() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [schedule, setSchedule] = useState({
    medication_name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    start_date: new Date(),
    end_date: null,
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    notes: '',
    reminder_enabled: true
  });

  const [errors, setErrors] = useState({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  const weekdays = [
    { id: 0, name: 'Sun' },
    { id: 1, name: 'Mon' },
    { id: 2, name: 'Tue' },
    { id: 3, name: 'Wed' },
    { id: 4, name: 'Thu' },
    { id: 5, name: 'Fri' },
    { id: 6, name: 'Sat' }
  ];

  const handleInputChange = (field, value) => {
    setSchedule(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFrequencyChange = (frequency) => {
    if (frequency === 'daily') {
      setSchedule(prev => ({
        ...prev,
        frequency,
        days_of_week: [0, 1, 2, 3, 4, 5, 6]
      }));
    } else {
      setSchedule(prev => ({
        ...prev,
        frequency,
        days_of_week: []
      }));
    }
  };

  const toggleDay = (dayId) => {
    setSchedule(prev => {
      const newDays = [...prev.days_of_week];
      const index = newDays.indexOf(dayId);
      
      if (index > -1) {
        newDays.splice(index, 1);
      } else {
        newDays.push(dayId);
      }
      
      return { ...prev, days_of_week: newDays };
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setSchedule(prev => ({ ...prev, start_date: selectedDate }));
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setSchedule(prev => ({ ...prev, end_date: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5);
      setSchedule(prev => {
        const newTimes = [...prev.times];
        newTimes[currentTimeIndex] = timeString;
        return { ...prev, times: newTimes };
      });
    }
  };

  const addTimeSlot = () => {
    setSchedule(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTimeSlot = (index) => {
    if (schedule.times.length === 1) {
      return;
    }
    setSchedule(prev => {
      const newTimes = [...prev.times];
      newTimes.splice(index, 1);
      return { ...prev, times: newTimes };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!schedule.medication_name.trim()) {
      newErrors.medication_name = 'Medication name is required';
    } else if (schedule.medication_name.trim().length < 2) {
      newErrors.medication_name = 'Medication name must be at least 2 characters long';
    }
    
    if (!schedule.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    
    if (schedule.frequency === 'specific_days' && schedule.days_of_week.length === 0) {
      newErrors.days_of_week = 'Please select at least one day';
    }
    
    if (schedule.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }
    
    for (const time of schedule.times) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        newErrors.times = 'Invalid time format. Use HH:MM format';
        break;
      }
    }
    
    if (schedule.end_date && schedule.start_date >= schedule.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        medication_name: schedule.medication_name.trim(),
        dosage: schedule.dosage.trim(),
        frequency: schedule.frequency,
        times: schedule.times,
        start_date: schedule.start_date.toISOString().split('T')[0],
        end_date: schedule.end_date ? schedule.end_date.toISOString().split('T')[0] : null,
        days_of_week: schedule.days_of_week,
        notes: schedule.notes.trim(),
        reminder_enabled: schedule.reminder_enabled
      };
      
      const result = await scheduleService.createSchedule(payload);
      
      if (result.success) {
        Alert.alert('Success', result.message, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('Error', 'Failed to create medication schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4a6fa5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Medication</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Medication Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#4a6fa5" />
            <Text style={styles.sectionTitle}>Medication Details</Text>
          </View>
          
          <InputField
            label="Medication Name *"
            value={schedule.medication_name}
            onChangeText={(value) => handleInputChange('medication_name', value)}
            placeholder="Enter medication name"
            error={errors.medication_name}
            style={styles.input}
            icon={<Ionicons name="medkit-outline" size={16} color="#4a6fa5" />}
          />
          
          <InputField
            label="Dosage *"
            value={schedule.dosage}
            onChangeText={(value) => handleInputChange('dosage', value)}
            placeholder="e.g., 1 tablet, 10mg"
            error={errors.dosage}
            style={styles.input}
            icon={<Ionicons name="medical-outline" size={16} color="#4a6fa5" />}
          />
          
          <InputField
            label="Notes (Optional)"
            value={schedule.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Additional instructions"
            multiline
            numberOfLines={2}
            style={styles.notesInput}
            icon={<Ionicons name="document-text-outline" size={16} color="#4a6fa5" />}
          />
        </View>
        
        {/* Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#4a6fa5" />
            <Text style={styles.sectionTitle}>Schedule</Text>
          </View>
          
          {/* Frequency Selection */}
          <View style={styles.frequencyContainer}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyOptions}>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  schedule.frequency === 'daily' && styles.frequencyOptionActive
                ]}
                onPress={() => handleFrequencyChange('daily')}
              >
                <Text style={[
                  styles.frequencyText,
                  schedule.frequency === 'daily' && styles.frequencyTextActive
                ]}>
                  Daily
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  schedule.frequency === 'specific_days' && styles.frequencyOptionActive
                ]}
                onPress={() => handleFrequencyChange('specific_days')}
              >
                <Text style={[
                  styles.frequencyText,
                  schedule.frequency === 'specific_days' && styles.frequencyTextActive
                ]}>
                  Specific Days
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Days Selection */}
          {schedule.frequency === 'specific_days' && (
            <View style={styles.daysContainer}>
              <Text style={styles.label}>Select Days</Text>
              <View style={styles.daysGrid}>
                {weekdays.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      schedule.days_of_week.includes(day.id) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[
                      styles.dayText,
                      schedule.days_of_week.includes(day.id) && styles.dayTextActive
                    ]}>
                      {day.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.days_of_week && (
                <Text style={styles.errorText}>{errors.days_of_week}</Text>
              )}
            </View>
          )}
          
          {/* Duration */}
          <View style={styles.durationContainer}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color="#4a6fa5" />
                <Text style={styles.dateText}>
                  {schedule.start_date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.toText}>to</Text>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color="#4a6fa5" />
                <Text style={styles.dateText}>
                  {schedule.end_date ? schedule.end_date.toLocaleDateString() : 'Ongoing'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.end_date && (
              <Text style={styles.errorText}>{errors.end_date}</Text>
            )}
          </View>
          
          {/* Times */}
          <View style={styles.timeContainer}>
            <View style={styles.timesHeader}>
              <Text style={styles.label}>Reminder Times</Text>
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={addTimeSlot}
              >
                <Ionicons name="add-circle" size={20} color="#4a6fa5" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timesGrid}>
              {schedule.times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      setCurrentTimeIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <Ionicons name="time-outline" size={16} color="#4a6fa5" />
                    <Text style={styles.timeText}>{time}</Text>
                  </TouchableOpacity>
                  
                  {schedule.times.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTimeButton}
                      onPress={() => removeTimeSlot(index)}
                    >
                      <Ionicons name="close-circle" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {errors.times && (
              <Text style={styles.errorText}>{errors.times}</Text>
            )}
          </View>
          
          {/* Reminder Toggle */}
          <View style={styles.reminderToggle}>
            <View style={styles.reminderLabel}>
              <Ionicons name="notifications-outline" size={18} color="#4a6fa5" />
              <Text style={styles.label}>Enable Reminders</Text>
            </View>
            <Switch
              value={schedule.reminder_enabled}
              onValueChange={(value) => handleInputChange('reminder_enabled', value)}
              trackColor={{ false: '#e0e0e0', true: '#a8c0d6' }}
              thumbColor={schedule.reminder_enabled ? '#4a6fa5' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#4a6fa5', '#38598b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.submitText}>Save Medication</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={schedule.start_date}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={schedule.end_date || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={schedule.start_date}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = schedule.times[currentTimeIndex].split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date;
          })()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 12, // Reduced from 16
    paddingBottom: 24, // Reduced from 32
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10, // Reduced from 12
    padding: 12, // Reduced from 16
    marginBottom: 12, // Reduced from 16
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.03, // Reduced shadow
    shadowRadius: 6, // Reduced shadow
    elevation: 2, // Reduced elevation
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16
  },
  sectionTitle: {
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 6, // Reduced from 8
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    marginBottom: 8, // Reduced from 12
  },
  notesInput: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13, // Reduced from 14
    fontWeight: '500',
    color: '#4a6fa5',
    marginBottom: 6, // Reduced from 8
    fontFamily: 'Poppins-Medium',
  },
  frequencyContainer: {
    marginBottom: 12, // Reduced from 16
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 6, // Reduced from 8
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 10, // Reduced from 12
    paddingHorizontal: 12, // Reduced from 16
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6, // Reduced from 8
    backgroundColor: '#f8f9fa',
  },
  frequencyOptionActive: {
    backgroundColor: '#4a6fa5',
    borderColor: '#4a6fa5',
  },
  frequencyText: {
    fontSize: 13, // Reduced from 14
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
  },
  frequencyTextActive: {
    color: '#ffffff',
  },
  daysContainer: {
    marginBottom: 12, // Reduced from 16
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // Reduced from 8
  },
  dayButton: {
    width: (screenWidth - 80) / 7,
    height: 36, // Reduced from 40
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6, // Reduced from 8
    backgroundColor: '#f8f9fa',
  },
  dayButtonActive: {
    backgroundColor: '#4a6fa5',
    borderColor: '#4a6fa5',
  },
  dayText: {
    fontSize: 11, // Reduced from 12
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
  },
  dayTextActive: {
    color: '#ffffff',
  },
  durationContainer: {
    marginBottom: 12, // Reduced from 16
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, // Reduced from 12
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6, // Reduced from 8
    backgroundColor: '#f8f9fa',
    minHeight: 36, // Added min height for consistency
  },
  dateText: {
    marginLeft: 6, // Reduced from 8
    fontSize: 13, // Reduced from 14
    color: '#495057',
    fontFamily: 'Poppins-Regular',
    flex: 1, // Added flex to prevent overflow
  },
  toText: {
    fontSize: 13, // Reduced from 14
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  timeContainer: {
    marginBottom: 12, // Reduced from 16
  },
  timesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  addTimeButton: {
    padding: 4,
  },
  timesGrid: {
    gap: 6, // Reduced from 8
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8
    marginBottom: 4, // Added margin for spacing
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, // Reduced from 12
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6, // Reduced from 8
    backgroundColor: '#f8f9fa',
    minHeight: 36, // Added min height for consistency
  },
  timeText: {
    marginLeft: 6, // Reduced from 8
    fontSize: 13, // Reduced from 14
    color: '#495057',
    fontFamily: 'Poppins-Regular',
  },
  removeTimeButton: {
    padding: 4,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8, // Added margin
  },
  reminderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11, // Reduced from 12
    marginTop: 3, // Reduced from 4
    fontFamily: 'Poppins-Regular',
  },
  submitButton: {
    borderRadius: 10, // Reduced from 12
    overflow: 'hidden',
    elevation: 3, // Reduced shadow
    shadowColor: '#4a6fa5',
    shadowOffset: { width: 0, height: 3 }, // Reduced shadow
    shadowOpacity: 0.2, // Reduced shadow
    shadowRadius: 6, // Reduced shadow
    marginTop: 8, // Added margin
  },
  submitGradient: {
    flexDirection: 'row',
    paddingVertical: 14, // Reduced from 16
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // Reduced from 8
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});