import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Pill, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import Button from '../components/Button';

const ScheduleList = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      medication_name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'daily',
      times: ['08:00'],
      start_date: '2025-01-01',
      end_date: null,
      reminder_enabled: true,
      status: 'active'
    },
    {
      id: 2,
      medication_name: 'Metformin',
      dosage: '500mg',
      frequency: 'daily',
      times: ['08:00', '20:00'],
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      reminder_enabled: true,
      status: 'active'
    },
    {
      id: 3,
      medication_name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'daily',
      times: ['20:00'],
      start_date: '2025-01-01',
      end_date: null,
      reminder_enabled: false,
      status: 'paused'
    },
    {
      id: 4,
      medication_name: 'Aspirin',
      dosage: '81mg',
      frequency: 'specific_days',
      times: ['08:00'],
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      reminder_enabled: true,
      status: 'completed'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.medication_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || schedule.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <PlayCircle size={16} />;
      case 'paused':
        return <AlertCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <PlayCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#27ae60';
      case 'paused':
        return '#f39c12';
      case 'completed':
        return '#3498db';
      default:
        return '#6c757d';
    }
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this medication schedule?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
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
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    controls: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    },
    controlsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    searchAndFilter: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    searchContainer: {
      position: 'relative',
      flex: 1,
      maxWidth: '400px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 44px',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6c757d'
    },
    filterSelect: {
      padding: '12px 16px',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      outline: 'none',
      cursor: 'pointer'
    },
    statsRow: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px'
    },
    statCard: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2c3e50',
      margin: '0 0 4px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6c757d',
      margin: 0
    },
    schedulesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    scheduleCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    scheduleHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    scheduleMainInfo: {
      flex: 1
    },
    medicationName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: '0 0 4px 0'
    },
    dosageInfo: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '0 0 8px 0'
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      color: '#fff'
    },
    scheduleDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#6c757d'
    },
    timesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center'
    },
    timeChip: {
      padding: '4px 12px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#2c3e50'
    },
    scheduleActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid #e9ecef',
      paddingTop: '16px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease'
    },
    editButton: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2'
    },
    deleteButton: {
      backgroundColor: '#ffebee',
      color: '#d32f2f'
    },
    reminderStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '40px',
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: '#fff'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: '0 0 8px 0'
    },
    emptyDescription: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '0 0 24px 0'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={() => onNavigate && onNavigate('dashboard')}>
            <ArrowLeft size={24} />
          </button>
          
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.headerTitle}>Medication Schedule</h1>
            <p style={styles.headerSubtitle}>Manage your medications</p>
          </div>
          
          <div style={styles.headerIcon}>
            <Calendar size={24} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.controls}
        >
          <div style={styles.controlsHeader}>
            <div style={styles.searchAndFilter}>
              <div style={styles.searchContainer}>
                <Search size={16} style={styles.searchIcon} />
                <input 
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <Button
              onClick={() => onNavigate && onNavigate('addSchedule')}
              icon={<Plus size={16} />}
            >
              Add Medication
            </Button>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{schedules.filter(s => s.status === 'active').length}</h3>
              <p style={styles.statLabel}>Active</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{schedules.filter(s => s.status === 'paused').length}</h3>
              <p style={styles.statLabel}>Paused</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{schedules.filter(s => s.status === 'completed').length}</h3>
              <p style={styles.statLabel}>Completed</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>{schedules.filter(s => s.reminder_enabled).length}</h3>
              <p style={styles.statLabel}>With Reminders</p>
            </div>
          </div>
        </motion.div>

        {/* Schedules List */}
        {filteredSchedules.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIcon}>
              <Pill size={40} />
            </div>
            <h3 style={styles.emptyTitle}>
              {searchTerm || filterStatus !== 'all' ? 'No matching medications' : 'No medications yet'}
            </h3>
            <p style={styles.emptyDescription}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first medication schedule'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                onClick={() => onNavigate && onNavigate('addSchedule')}
                icon={<Plus size={16} />}
              >
                Add Your First Medication
              </Button>
            )}
          </motion.div>
        ) : (
          <div style={styles.schedulesList}>
            {filteredSchedules.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                style={styles.scheduleCard}
                whileHover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={styles.scheduleHeader}>
                  <div style={styles.scheduleMainInfo}>
                    <h3 style={styles.medicationName}>{schedule.medication_name}</h3>
                    <p style={styles.dosageInfo}>
                      {schedule.dosage} • {schedule.frequency === 'daily' ? 'Daily' : 'Specific Days'}
                    </p>
                  </div>
                  
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(schedule.status)
                  }}>
                    {getStatusIcon(schedule.status)}
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </div>
                </div>

                <div style={styles.scheduleDetails}>
                  <div style={styles.detailItem}>
                    <Clock size={16} />
                    <span>Times:</span>
                    <div style={styles.timesContainer}>
                      {schedule.times.map((time, timeIndex) => (
                        <span key={timeIndex} style={styles.timeChip}>
                          {formatTime12Hour(time)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.detailItem}>
                    <Calendar size={16} />
                    <span>Duration:</span>
                    <span>{formatDate(schedule.start_date)} - {formatDate(schedule.end_date)}</span>
                  </div>
                </div>

                <div style={styles.scheduleActions}>
                  <div style={styles.reminderStatus}>
                    {schedule.reminder_enabled ? (
                      <>
                        <CheckCircle size={16} color="#27ae60" />
                        Reminders enabled
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} color="#f39c12" />
                        Reminders disabled
                      </>
                    )}
                  </div>

                  <div style={styles.actionButtons}>
                    <button style={{
                      ...styles.actionButton,
                      ...styles.editButton
                    }}>
                      <Edit3 size={14} />
                      Edit
                    </button>
                    
                    <button 
                      style={{
                        ...styles.actionButton,
                        ...styles.deleteButton
                      }}
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
