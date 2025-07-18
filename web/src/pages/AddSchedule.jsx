import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Pill, 
  FileText, 
  Bell, 
  BellOff, 
  Plus, 
  X, 
  Save,
  CheckCircle,
  Infinity
} from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Switch from '../components/Switch';
import DateTimePicker from '../components/DateTimePicker';
import { scheduleService } from '../services/scheduleApi';

const AddSchedule = ({ onNavigate }) => {
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
        alert(result.message);
        // Navigate back or reset form
        if (onNavigate) {
          onNavigate('dashboard');
        } else {
          window.history.back();
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create medication schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      window.history.back();
    }
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f1e8',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      color: '#fff',
      padding: '20px',
      borderRadius: '0 0 20px 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '20px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff'
    },
    headerTitleContainer: {
      textAlign: 'center',
      flex: 1,
      margin: '0 20px'
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '12px',
      opacity: 0.8,
      margin: '2px 0 0 0'
    },
    headerIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    },
    progressCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    progressHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      gap: '8px'
    },
    progressTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4a6fa5'
    },
    progressBar: {
      height: '4px',
      backgroundColor: '#e9ecef',
      borderRadius: '2px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#4a6fa5',
      borderRadius: '2px',
      width: '25%'
    },
    section: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '12px'
    },
    sectionIconContainer: {
      width: '36px',
      height: '36px',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: 0
    },
    sectionSubtitle: {
      fontSize: '12px',
      color: '#6c757d',
      margin: '2px 0 0 0'
    },
    label: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#2c3e50',
      marginBottom: '12px',
      display: 'block'
    },
    frequencyContainer: {
      marginBottom: '24px'
    },
    frequencyOptions: {
      display: 'flex',
      gap: '12px'
    },
    frequencyOption: {
      flex: 1,
      padding: '14px 16px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    frequencyOptionActive: {
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      color: '#fff'
    },
    frequencyOptionInactive: {
      background: '#f8f9fa',
      color: '#6c757d'
    },
    daysContainer: {
      marginBottom: '24px'
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px'
    },
    dayButton: {
      padding: '12px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    dayButtonActive: {
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      color: '#fff'
    },
    dayButtonInactive: {
      background: '#f8f9fa',
      color: '#6c757d'
    },
    durationContainer: {
      marginBottom: '24px'
    },
    dateRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    dateButton: {
      flex: 1,
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    dateContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    dateTextContainer: {
      flex: 1
    },
    dateLabel: {
      fontSize: '12px',
      color: '#6c757d',
      margin: '0 0 2px 0'
    },
    dateText: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#2c3e50',
      margin: 0
    },
    arrowContainer: {
      padding: '8px'
    },
    timeContainer: {
      marginBottom: '24px'
    },
    timesHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    timesGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    timeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    timeButton: {
      flex: 1,
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    timeContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    timeText: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#2c3e50',
      flex: 1
    },
    timeFormat: {
      fontSize: '12px',
      color: '#6c757d'
    },
    removeTimeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: '#e74c3c'
    },
    reminderContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f8f9fa',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e9ecef'
    },
    reminderContent: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      gap: '16px'
    },
    reminderIconContainer: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      background: 'rgba(74, 111, 165, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4a6fa5'
    },
    reminderTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#2c3e50',
      margin: 0
    },
    reminderDescription: {
      fontSize: '12px',
      color: '#6c757d',
      margin: '2px 0 0 0'
    },
    submitContainer: {
      marginTop: '10px'
    },
    errorText: {
      fontSize: '12px',
      color: '#e74c3c',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
          
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.headerTitle}>Add Medication</h1>
            <p style={styles.headerSubtitle}>Create a new schedule</p>
          </div>
          
          <div style={styles.headerIcon}>
            <Pill size={24} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.progressCard}
        >
          <div style={styles.progressHeader}>
            <CheckCircle size={20} color="#4a6fa5" />
            <span style={styles.progressTitle}>Medication Setup</span>
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
        </motion.div>

        {/* Medication Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.section}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIconContainer}>
              <Pill size={18} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Medication Details</h2>
              <p style={styles.sectionSubtitle}>Enter medication information</p>
            </div>
          </div>
          
          <InputField
            label="Medication Name *"
            value={schedule.medication_name}
            onChangeText={(value) => handleInputChange('medication_name', value)}
            placeholder="Enter medication name"
            error={errors.medication_name}
            icon={<Pill size={16} color="#4a6fa5" />}
          />
          
          <InputField
            label="Dosage *"
            value={schedule.dosage}
            onChangeText={(value) => handleInputChange('dosage', value)}
            placeholder="e.g., 1 tablet, 10mg"
            error={errors.dosage}
            icon={<Pill size={16} color="#4a6fa5" />}
          />
          
          <InputField
            label="Notes (Optional)"
            value={schedule.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Additional instructions"
            multiline
            numberOfLines={3}
            icon={<FileText size={16} color="#4a6fa5" />}
          />
        </motion.div>
        
        {/* Schedule Configuration Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.section}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIconContainer}>
              <Calendar size={18} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Schedule Configuration</h2>
              <p style={styles.sectionSubtitle}>Set up timing and frequency</p>
            </div>
          </div>
          
          {/* Frequency Selection */}
          <div style={styles.frequencyContainer}>
            <label style={styles.label}>Frequency</label>
            <div style={styles.frequencyOptions}>
              <button
                style={{
                  ...styles.frequencyOption,
                  ...(schedule.frequency === 'daily' 
                    ? styles.frequencyOptionActive 
                    : styles.frequencyOptionInactive)
                }}
                onClick={() => handleFrequencyChange('daily')}
              >
                <Infinity size={16} />
                Daily
              </button>
              
              <button
                style={{
                  ...styles.frequencyOption,
                  ...(schedule.frequency === 'specific_days' 
                    ? styles.frequencyOptionActive 
                    : styles.frequencyOptionInactive)
                }}
                onClick={() => handleFrequencyChange('specific_days')}
              >
                <Calendar size={16} />
                Specific Days
              </button>
            </div>
          </div>
          
          {/* Days Selection */}
          {schedule.frequency === 'specific_days' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={styles.daysContainer}
            >
              <label style={styles.label}>Select Days</label>
              <div style={styles.daysGrid}>
                {weekdays.map(day => (
                  <button
                    key={day.id}
                    style={{
                      ...styles.dayButton,
                      ...(schedule.days_of_week.includes(day.id) 
                        ? styles.dayButtonActive 
                        : styles.dayButtonInactive)
                    }}
                    onClick={() => toggleDay(day.id)}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
              {errors.days_of_week && (
                <div style={styles.errorText}>{errors.days_of_week}</div>
              )}
            </motion.div>
          )}
          
          {/* Duration */}
          <div style={styles.durationContainer}>
            <label style={styles.label}>Duration</label>
            <div style={styles.dateRow}>
              <div style={styles.dateButton} onClick={() => setShowStartDatePicker(true)}>
                <div style={styles.dateContent}>
                  <Calendar size={18} color="#4a6fa5" />
                  <div style={styles.dateTextContainer}>
                    <p style={styles.dateLabel}>Start Date</p>
                    <p style={styles.dateText}>
                      {schedule.start_date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={styles.arrowContainer}>
                <ArrowLeft size={16} color="#4a6fa5" style={{ transform: 'rotate(180deg)' }} />
              </div>
              
              <div style={styles.dateButton} onClick={() => setShowEndDatePicker(true)}>
                <div style={styles.dateContent}>
                  <Calendar size={18} color="#4a6fa5" />
                  <div style={styles.dateTextContainer}>
                    <p style={styles.dateLabel}>End Date</p>
                    <p style={styles.dateText}>
                      {schedule.end_date ? 
                        schedule.end_date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Ongoing'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {errors.end_date && (
              <div style={styles.errorText}>{errors.end_date}</div>
            )}
          </div>
          
          {/* Times */}
          <div style={styles.timeContainer}>
            <div style={styles.timesHeader}>
              <label style={styles.label}>Reminder Times</label>
              <Button
                onClick={addTimeSlot}
                size="small"
                icon={<Plus size={16} />}
              >
                Add Time
              </Button>
            </div>
            
            <div style={styles.timesGrid}>
              {schedule.times.map((time, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={styles.timeRow}
                >
                  <div 
                    style={styles.timeButton}
                    onClick={() => {
                      setCurrentTimeIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <div style={styles.timeContent}>
                      <Clock size={18} color="#4a6fa5" />
                      <span style={styles.timeText}>{time}</span>
                      <span style={styles.timeFormat}>
                        {formatTime12Hour(time)}
                      </span>
                    </div>
                  </div>
                  
                  {schedule.times.length > 1 && (
                    <button
                      style={styles.removeTimeButton}
                      onClick={() => removeTimeSlot(index)}
                    >
                      <X size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {errors.times && (
              <div style={styles.errorText}>{errors.times}</div>
            )}
          </div>
          
          {/* Reminder Toggle */}
          <div style={styles.reminderContainer}>
            <div style={styles.reminderContent}>
              <div style={styles.reminderIconContainer}>
                {schedule.reminder_enabled ? <Bell size={18} /> : <BellOff size={18} />}
              </div>
              <div>
                <h3 style={styles.reminderTitle}>Push Notifications</h3>
                <p style={styles.reminderDescription}>
                  Get reminded when it's time to take your medication
                </p>
              </div>
            </div>
            <Switch
              checked={schedule.reminder_enabled}
              onChange={(value) => handleInputChange('reminder_enabled', value)}
            />
          </div>
        </motion.div>
        
        {/* Submit Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.submitContainer}
        >
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            size="large"
            icon={<Save size={20} />}
            style={{ width: '100%' }}
          >
            Save Medication Schedule
          </Button>
        </motion.div>
      </div>
      
      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '20px',
            minWidth: '300px'
          }}>
            <h3>Select Start Date</h3>
            <DateTimePicker
              value={schedule.start_date}
              mode="date"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button onClick={() => setShowStartDatePicker(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showEndDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '20px',
            minWidth: '300px'
          }}>
            <h3>Select End Date</h3>
            <DateTimePicker
              value={schedule.end_date || new Date()}
              mode="date"
              onChange={handleEndDateChange}
              minimumDate={schedule.start_date}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button onClick={() => setShowEndDatePicker(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showTimePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '20px',
            minWidth: '300px'
          }}>
            <h3>Select Time</h3>
            <DateTimePicker
              value={(() => {
                const [hours, minutes] = schedule.times[currentTimeIndex].split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10));
                date.setMinutes(parseInt(minutes, 10));
                return date;
              })()}
              mode="time"
              onChange={handleTimeChange}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button onClick={() => setShowTimePicker(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSchedule;
