import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { scheduleService } from '../Services/scheduleApi';
import { moderateScale, verticalScale } from '../Utils/metrics';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTodaySchedules();
  }, []);

  const fetchTodaySchedules = async () => {
    try {
      const result = await scheduleService.getTodaySchedules();
      if (result.success) {
        setTodaySchedules(result.data);
      } else {
        console.error('Error fetching today\'s schedules:', result.message);
      }
    } catch (error) {
      console.error('Error fetching today\'s schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMedication = async (schedule, status) => {
    try {
      const currentTime = new Date().toISOString();
      
      const logData = {
        schedule_id: schedule._id,
        status: status,
        taken_at: currentTime,
        notes: ''
      };
      
      const result = await scheduleService.logMedication(logData);
      if (result.success) {
        Alert.alert('Success', result.message);
        fetchTodaySchedules(); // Refresh
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error logging medication:', error);
      Alert.alert('Error', 'Failed to log medication');
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderScheduleCard = (schedule) => (
    <View key={schedule._id} style={styles.scheduleCard}>
      <View style={styles.cardHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{schedule.medication_name}</Text>
          <Text style={styles.dosage}>{schedule.dosage}</Text>
        </View>
        <View style={styles.timeContainer}>
          {schedule.times.map((time, index) => (
            <Text key={index} style={styles.timeText}>{formatTime(time)}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.takenButton}
          onPress={() => handleLogMedication(schedule, 'taken')}
        >
          <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
          <Text style={styles.buttonText}>Taken</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => handleLogMedication(schedule, 'skipped')}
        >
          <Ionicons name="close-circle" size={moderateScale(16)} color="#fff" />
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#4a6fa5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Medications</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/Screen/AddSchedule')}
        >
          <Ionicons name="add" size={moderateScale(24)} color="#4a6fa5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#4a6fa5', '#3d5a8a']}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="pill" size={moderateScale(24)} color="#fff" />
              <Text style={styles.statNumber}>{todaySchedules.length}</Text>
              <Text style={styles.statLabel}>Medications Today</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.schedulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity 
              onPress={() => router.push('/Screen/ScheduleList')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={moderateScale(16)} color="#4a6fa5" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a6fa5" />
              <Text style={styles.loadingText}>Loading today's medications...</Text>
            </View>
          ) : todaySchedules.length > 0 ? (
            todaySchedules.map(renderScheduleCard)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="pill-off" size={moderateScale(48)} color="#ccc" />
              <Text style={styles.emptyText}>No medications scheduled for today</Text>
              <TouchableOpacity 
                style={styles.addScheduleButton}
                onPress={() => router.push('/Screen/AddSchedule')}
              >
                <Text style={styles.addScheduleText}>Add a Schedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/Screen/AddSchedule')}
            >
              <Ionicons name="add-circle" size={moderateScale(24)} color="#4a6fa5" />
              <Text style={styles.actionText}>Add Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/Screen/ScheduleList')}
            >
              <Ionicons name="list" size={moderateScale(24)} color="#4a6fa5" />
              <Text style={styles.actionText}>All Schedules</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    padding: moderateScale(8),
  },
  content: {
    flex: 1,
    padding: moderateScale(20),
  },
  statsContainer: {
    marginBottom: verticalScale(20),
  },
  statsCard: {
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: '#fff',
    marginVertical: verticalScale(8),
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Poppins-Medium',
  },
  schedulesSection: {
    marginBottom: verticalScale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'Poppins-SemiBold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Medium',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'Poppins-SemiBold',
  },
  dosage: {
    fontSize: moderateScale(14),
    color: '#6c757d',
    marginTop: verticalScale(2),
    fontFamily: 'Poppins-Regular',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: moderateScale(14),
    color: '#4a6fa5',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  takenButton: {
    flex: 1,
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    gap: moderateScale(6),
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    gap: moderateScale(6),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#6c757d',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(20),
    fontFamily: 'Poppins-Regular',
  },
  addScheduleButton: {
    backgroundColor: '#4a6fa5',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  addScheduleText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  quickActions: {
    marginBottom: verticalScale(20),
  },
  actionGrid: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: moderateScale(12),
    color: '#4a6fa5',
    marginTop: verticalScale(8),
    fontFamily: 'Poppins-Medium',
  },
});
