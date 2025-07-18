import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, Dimensions, StatusBar, Platform, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleService } from '../Services/scheduleApi';
import { moderateScale, verticalScale } from '../Utils/metrics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width: screenWidth, width } = Dimensions.get('window');

// Custom InputField component with proper styling
const InputField = ({ label, value, onChangeText, placeholder, error, multiline = false, numberOfLines = 1, icon, style }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError, style]}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.textInputMultiline,
            icon && styles.textInputWithIcon
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

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
      <StatusBar barStyle="light-content" backgroundColor="#4a6fa5" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#4a6fa5', '#38598b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add Medication</Text>
            <Text style={styles.headerSubtitle}>Create a new schedule</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <Animatable.View 
          animation="fadeInDown" 
          delay={200}
          style={styles.progressCard}
        >
          <View style={styles.progressHeader}>
            <Ionicons name="checkbox-outline" size={20} color="#4a6fa5" />
            <Text style={styles.progressTitle}>Medication Setup</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </Animatable.View>

        {/* Medication Details Section */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={300}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#4a6fa5', '#38598b']}
              style={styles.sectionIconContainer}
            >
              <Ionicons name="medical" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Medication Details</Text>
              <Text style={styles.sectionSubtitle}>Enter medication information</Text>
            </View>
          </View>
          
          <View style={styles.inputsContainer}>
            <InputField
              label="Medication Name *"
              value={schedule.medication_name}
              onChangeText={(value) => handleInputChange('medication_name', value)}
              placeholder="Enter medication name"
              error={errors.medication_name}
              icon={<Ionicons name="medkit-outline" size={16} color="#4a6fa5" />}
            />
            
            <InputField
              label="Dosage *"
              value={schedule.dosage}
              onChangeText={(value) => handleInputChange('dosage', value)}
              placeholder="e.g., 1 tablet, 10mg"
              error={errors.dosage}
              icon={<Ionicons name="medical-outline" size={16} color="#4a6fa5" />}
            />
            
            <InputField
              label="Notes (Optional)"
              value={schedule.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Additional instructions"
              multiline
              numberOfLines={3}
              icon={<Ionicons name="document-text-outline" size={16} color="#4a6fa5" />}
            />
          </View>
        </Animatable.View>
        
        {/* Schedule Configuration Section */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={400}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#4a6fa5', '#38598b']}
              style={styles.sectionIconContainer}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Schedule Configuration</Text>
              <Text style={styles.sectionSubtitle}>Set up timing and frequency</Text>
            </View>
          </View>
          
          {/* Enhanced Frequency Selection */}
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
                <LinearGradient
                  colors={schedule.frequency === 'daily' ? ['#4a6fa5', '#38598b'] : ['#f8f9fa', '#f8f9fa']}
                  style={styles.frequencyGradient}
                >
                  <Ionicons 
                    name="infinite" 
                    size={16} 
                    color={schedule.frequency === 'daily' ? '#fff' : '#6c757d'} 
                  />
                  <Text style={[
                    styles.frequencyText,
                    schedule.frequency === 'daily' && styles.frequencyTextActive
                  ]}>
                    Daily
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  schedule.frequency === 'specific_days' && styles.frequencyOptionActive
                ]}
                onPress={() => handleFrequencyChange('specific_days')}
              >
                <LinearGradient
                  colors={schedule.frequency === 'specific_days' ? ['#4a6fa5', '#38598b'] : ['#f8f9fa', '#f8f9fa']}
                  style={styles.frequencyGradient}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={16} 
                    color={schedule.frequency === 'specific_days' ? '#fff' : '#6c757d'} 
                  />
                  <Text style={[
                    styles.frequencyText,
                    schedule.frequency === 'specific_days' && styles.frequencyTextActive
                  ]}>
                    Specific Days
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Enhanced Days Selection */}
          {schedule.frequency === 'specific_days' && (
            <Animatable.View animation="slideInRight" style={styles.daysContainer}>
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
                    <LinearGradient
                      colors={schedule.days_of_week.includes(day.id) ? ['#4a6fa5', '#38598b'] : ['#f8f9fa', '#f8f9fa']}
                      style={styles.dayGradient}
                    >
                      <Text style={[
                        styles.dayText,
                        schedule.days_of_week.includes(day.id) && styles.dayTextActive
                      ]}>
                        {day.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.days_of_week && (
                <Text style={styles.errorText}>{errors.days_of_week}</Text>
              )}
            </Animatable.View>
          )}
          
          {/* Enhanced Duration */}
          <View style={styles.durationContainer}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <View style={styles.dateContent}>
                  <Ionicons name="calendar-outline" size={18} color="#4a6fa5" />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateText}>
                      {schedule.start_date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={16} color="#4a6fa5" />
              </View>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <View style={styles.dateContent}>
                  <Ionicons name="calendar-outline" size={18} color="#4a6fa5" />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateText}>
                      {schedule.end_date ? 
                        schedule.end_date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Ongoing'
                      }
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            {errors.end_date && (
              <Text style={styles.errorText}>{errors.end_date}</Text>
            )}
          </View>
          
          {/* Enhanced Times */}
          <View style={styles.timeContainer}>
            <View style={styles.timesHeader}>
              <Text style={styles.label}>Reminder Times</Text>
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={addTimeSlot}
              >
                <LinearGradient
                  colors={['#4a6fa5', '#38598b']}
                  style={styles.addTimeGradient}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addTimeText}>Add Time</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timesGrid}>
              {schedule.times.map((time, index) => (
                <Animatable.View 
                  key={index} 
                  animation="bounceIn" 
                  delay={index * 100}
                  style={styles.timeRow}
                >
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      setCurrentTimeIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <View style={styles.timeContent}>
                      <Ionicons name="time-outline" size={18} color="#4a6fa5" />
                      <Text style={styles.timeText}>{time}</Text>
                      <Text style={styles.timeFormat}>
                        {(() => {
                          const [hours, minutes] = time.split(':');
                          const hour = parseInt(hours, 10);
                          const period = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          return `${displayHour}:${minutes} ${period}`;
                        })()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {schedule.times.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTimeButton}
                      onPress={() => removeTimeSlot(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </Animatable.View>
              ))}
            </View>
            {errors.times && (
              <Text style={styles.errorText}>{errors.times}</Text>
            )}
          </View>
          
          {/* Enhanced Reminder Toggle */}
          <View style={styles.reminderContainer}>
            <View style={styles.reminderContent}>
              <View style={styles.reminderIconContainer}>
                <Ionicons 
                  name={schedule.reminder_enabled ? "notifications" : "notifications-off"} 
                  size={18} 
                  color="#4a6fa5" 
                />
              </View>
              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderTitle}>Push Notifications</Text>
                <Text style={styles.reminderDescription}>
                  Get reminded when it's time to take your medication
                </Text>
              </View>
            </View>
            <Switch
              value={schedule.reminder_enabled}
              onValueChange={(value) => handleInputChange('reminder_enabled', value)}
              trackColor={{ false: '#e0e0e0', true: '#a8c0d6' }}
              thumbColor={schedule.reminder_enabled ? '#4a6fa5' : '#f4f3f4'}
              ios_backgroundColor="#e0e0e0"
            />
          </View>
        </Animatable.View>
        
        {/* Enhanced Submit Button */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={500}
          style={styles.submitContainer}
        >
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? ['#a8c0d6', '#a8c0d6'] : ['#4a6fa5', '#38598b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitText}>Creating Schedule...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.submitText}>Save Medication Schedule</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
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
    backgroundColor: '#f5f1e8',
  },
  
  // Enhanced Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a6fa5',
    marginLeft: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a6fa5',
    borderRadius: 2,
  },
  
  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  
  // Input Styles
  inputsContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  textInputWithIcon: {
    paddingLeft: 0,
  },
  
  // Label Styles
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 12,
  },
  
  // Frequency Styles
  frequencyContainer: {
    marginBottom: 24,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  frequencyGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  
  // Days Selection Styles
  daysContainer: {
    marginBottom: 24,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: (width - 80) / 4 - 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
  },
  dayTextActive: {
    color: '#fff',
  },
  
  // Duration Styles
  durationContainer: {
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#2c3e50',
  },
  arrowContainer: {
    padding: 8,
  },
  
  // Time Styles
  timeContainer: {
    marginBottom: 24,
  },
  timesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTimeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addTimeGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  timesGrid: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2c3e50',
    flex: 1,
  },
  timeFormat: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
  },
  removeTimeButton: {
    padding: 8,
  },
  
  // Reminder Styles
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#2c3e50',
  },
  reminderDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
    marginTop: 2,
  },
  
  // Submit Button Styles
  submitContainer: {
    marginTop: 10,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  
  // Error Text
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#e74c3c',
    marginTop: 4,
  },
});