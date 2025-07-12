import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scheduleService } from '../Services/scheduleApi';
import { formatDate, formatTime } from '../Utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { moderateScale, verticalScale } from '../Utils/metrics';

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchSchedules = async () => {
    try {
      const result = await scheduleService.getAllSchedules();
      if (result.success && Array.isArray(result.data)) {
        setSchedules(result.data);
      } else {
        console.log('Invalid schedule data received:', result);
        setSchedules([]);
        if (result.message) {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
      Alert.alert('Error', 'Failed to load medication schedules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this medication schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await scheduleService.deleteSchedule(id);
              if (result.success) {
                setSchedules(schedules.filter(schedule => schedule._id !== id));
                Alert.alert('Success', result.message);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete medication schedule');
            }
          }
        }
      ]
    );
  };

  const handleLogMedication = async (schedule, status) => {
    try {
      const currentTime = new Date().toISOString();
      
      const logData = {
        schedule_id: schedule._id,
        status: status, // 'taken' or 'skipped'
        taken_at: currentTime,
        notes: ''
      };
      
      const result = await scheduleService.logMedication(logData);
      if (result.success) {
        Alert.alert('Success', result.message);
        fetchSchedules(); // Refresh the list
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error logging medication:', error);
      Alert.alert('Error', 'Failed to log medication');
    }
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.medicationName}>{item.medication_name || 'Unknown Medication'}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => router.push(`/Screen/EditSchedule?id=${item._id}`)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={moderateScale(18)} color="#4a6fa5" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteSchedule(item._id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={moderateScale(18)} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.scheduleDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="medical" size={moderateScale(16)} color="#4a6fa5" />
            <Text style={styles.dosageText}>Dosage: {item.dosage || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={moderateScale(16)} color="#4a6fa5" />
            <Text style={styles.timesText}>
              Times: {(item.times || []).map(time => formatTime(time)).join(', ') || 'No times set'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={moderateScale(16)} color="#4a6fa5" />
            <Text style={styles.dateText}>
              {formatDate(item.start_date)} - {item.end_date ? formatDate(item.end_date) : 'Ongoing'}
            </Text>
          </View>
          
          {item.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={moderateScale(16)} color="#4a6fa5" />
              <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.logButtons}>
          <TouchableOpacity 
            style={styles.takenButton}
            onPress={() => handleLogMedication(item, 'taken')}
          >
            <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" />
            <Text style={styles.buttonText}>Taken</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skippedButton}
            onPress={() => handleLogMedication(item, 'skipped')}
          >
            <Ionicons name="close-circle" size={moderateScale(16)} color="#fff" />
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
        <Text style={styles.loadingText}>Loading your medication schedules...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Medications</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/Screen/AddSchedule')}
        >
          <Ionicons name="add" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {schedules.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="medkit-outline" size={moderateScale(60)} color="#4a6fa5" />
          <Text style={styles.emptyStateText}>
            You haven't added any medication schedules yet
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push('/Screen/Medication/AddSchedule')}
          >
            <Text style={styles.emptyStateButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderItem}
          keyExtractor={item => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    backgroundColor: '#4a6fa5',
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4a6fa5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  listContainer: {
    padding: moderateScale(16),
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  medicationName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: moderateScale(6),
    marginRight: moderateScale(8),
  },
  deleteButton: {
    padding: moderateScale(6),
  },
  scheduleDetails: {
    marginBottom: verticalScale(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  dosageText: {
    fontSize: moderateScale(14),
    color: '#555',
    marginLeft: moderateScale(8),
    fontFamily: 'Poppins-Regular',
  },
  timesText: {
    fontSize: moderateScale(14),
    color: '#555',
    marginLeft: moderateScale(8),
    fontFamily: 'Poppins-Regular',
  },
  dateText: {
    fontSize: moderateScale(14),
    color: '#555',
    marginLeft: moderateScale(8),
    fontFamily: 'Poppins-Regular',
  },
  notesText: {
    fontSize: moderateScale(14),
    color: '#555',
    marginLeft: moderateScale(8),
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  logButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  takenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    flex: 1,
    marginRight: moderateScale(8),
  },
  skippedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    flex: 1,
    marginLeft: moderateScale(8),
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: moderateScale(6),
    fontSize: moderateScale(14),
    fontFamily: 'Poppins-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  emptyStateText: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    marginVertical: verticalScale(16),
    fontFamily: 'Poppins-Regular',
  },
  emptyStateButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(12),
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});