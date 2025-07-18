import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Pill, 
  Plus, 
  Bell, 
  User, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import Button from '../components/Button';

const Dashboard = ({ onNavigate }) => {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      nextTime: '08:00',
      status: 'upcoming',
      frequency: 'Daily'
    },
    {
      id: 2,
      name: 'Metformin',
      dosage: '500mg',
      nextTime: '12:00',
      status: 'taken',
      frequency: 'Twice daily'
    },
    {
      id: 3,
      name: 'Lisinopril',
      dosage: '10mg',
      nextTime: '20:00',
      status: 'missed',
      frequency: 'Daily'
    }
  ]);

  const [stats, setStats] = useState({
    todayTaken: 2,
    todayTotal: 4,
    weeklyAdherence: 85,
    activeMedications: 3
  });

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
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    welcomeText: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '600'
    },
    subtitleText: {
      margin: '4px 0 0 0',
      fontSize: '14px',
      opacity: 0.8
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      transition: 'all 0.2s ease'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
      position: 'relative',
      overflow: 'hidden'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2c3e50',
      margin: '8px 0 4px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0
    },
    statProgress: {
      width: '100%',
      height: '4px',
      backgroundColor: '#e9ecef',
      borderRadius: '2px',
      marginTop: '12px',
      overflow: 'hidden'
    },
    statProgressFill: {
      height: '100%',
      borderRadius: '2px',
      transition: 'width 0.3s ease'
    },
    quickActions: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    },
    actionCard: {
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      background: '#f8f9fa',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    actionIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '24px',
      margin: '0 auto 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    },
    actionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: '0 0 4px 0'
    },
    actionDescription: {
      fontSize: '12px',
      color: '#6c757d',
      margin: 0
    },
    medicationsSection: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    },
    medicationsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    searchInput: {
      flex: 1,
      padding: '12px 16px 12px 44px',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      position: 'relative'
    },
    searchInputContainer: {
      position: 'relative',
      flex: 1
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6c757d'
    },
    medicationCard: {
      padding: '16px',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      marginBottom: '12px',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    medicationHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    medicationName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: 0
    },
    medicationDosage: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '4px 0'
    },
    medicationFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '12px'
    },
    medicationTime: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      color: '#6c757d'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    statusUpcoming: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2'
    },
    statusTaken: {
      backgroundColor: '#e8f5e8',
      color: '#2e7d32'
    },
    statusMissed: {
      backgroundColor: '#ffebee',
      color: '#d32f2f'
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming':
        return styles.statusUpcoming;
      case 'taken':
        return styles.statusTaken;
      case 'missed':
        return styles.statusMissed;
      default:
        return styles.statusUpcoming;
    }
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              <User size={24} />
            </div>
            <div>
              <h1 style={styles.welcomeText}>Welcome back, John!</h1>
              <p style={styles.subtitleText}>Today is {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <button style={styles.iconButton}>
              <Search size={20} />
            </button>
            <button style={styles.iconButton}>
              <Bell size={20} />
            </button>
            <button style={styles.iconButton}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.statsGrid}
        >
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div style={{
                ...styles.statIcon,
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)'
              }}>
                <CheckCircle size={20} />
              </div>
              <TrendingUp size={16} color="#27ae60" />
            </div>
            <h3 style={styles.statValue}>{stats.todayTaken}/{stats.todayTotal}</h3>
            <p style={styles.statLabel}>Today's Medications</p>
            <div style={styles.statProgress}>
              <div style={{
                ...styles.statProgressFill,
                width: `${(stats.todayTaken / stats.todayTotal) * 100}%`,
                backgroundColor: '#27ae60'
              }} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div style={{
                ...styles.statIcon,
                background: 'linear-gradient(135deg, #3498db, #2980b9)'
              }}>
                <Calendar size={20} />
              </div>
            </div>
            <h3 style={styles.statValue}>{stats.weeklyAdherence}%</h3>
            <p style={styles.statLabel}>Weekly Adherence</p>
            <div style={styles.statProgress}>
              <div style={{
                ...styles.statProgressFill,
                width: `${stats.weeklyAdherence}%`,
                backgroundColor: '#3498db'
              }} />
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div style={{
                ...styles.statIcon,
                background: 'linear-gradient(135deg, #4a6fa5, #38598b)'
              }}>
                <Pill size={20} />
              </div>
            </div>
            <h3 style={styles.statValue}>{stats.activeMedications}</h3>
            <p style={styles.statLabel}>Active Medications</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div style={{
                ...styles.statIcon,
                background: 'linear-gradient(135deg, #f39c12, #e67e22)'
              }}>
                <AlertCircle size={20} />
              </div>
            </div>
            <h3 style={styles.statValue}>1</h3>
            <p style={styles.statLabel}>Missed Doses</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.quickActions}
        >
          <h2 style={styles.sectionTitle}>
            <Plus size={24} color="#4a6fa5" />
            Quick Actions
          </h2>
          <div style={styles.actionsGrid}>
            <div 
              style={styles.actionCard}
              onClick={() => onNavigate && onNavigate('addSchedule')}
            >
              <div style={{
                ...styles.actionIcon,
                background: 'linear-gradient(135deg, #4a6fa5, #38598b)'
              }}>
                <Plus size={24} />
              </div>
              <h3 style={styles.actionTitle}>Add Medication</h3>
              <p style={styles.actionDescription}>Create a new medication schedule</p>
            </div>

            <div style={styles.actionCard}>
              <div style={{
                ...styles.actionIcon,
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)'
              }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={styles.actionTitle}>Mark as Taken</h3>
              <p style={styles.actionDescription}>Log your medication intake</p>
            </div>

            <div style={styles.actionCard}>
              <div style={{
                ...styles.actionIcon,
                background: 'linear-gradient(135deg, #3498db, #2980b9)'
              }}>
                <Calendar size={24} />
              </div>
              <h3 style={styles.actionTitle}>View Schedule</h3>
              <p style={styles.actionDescription}>Check your medication calendar</p>
            </div>

            <div style={styles.actionCard}>
              <div style={{
                ...styles.actionIcon,
                background: 'linear-gradient(135deg, #f39c12, #e67e22)'
              }}>
                <Bell size={24} />
              </div>
              <h3 style={styles.actionTitle}>Set Reminder</h3>
              <p style={styles.actionDescription}>Configure notification settings</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Medications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.medicationsSection}
        >
          <div style={styles.medicationsHeader}>
            <h2 style={styles.sectionTitle}>
              <Pill size={24} color="#4a6fa5" />
              Today's Medications
            </h2>
            <Button size="small" icon={<Filter size={16} />}>
              Filter
            </Button>
          </div>

          <div style={styles.searchBar}>
            <div style={styles.searchInputContainer}>
              <Search size={16} style={styles.searchIcon} />
              <input 
                type="text"
                placeholder="Search medications..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div>
            {medications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                style={styles.medicationCard}
              >
                <div style={styles.medicationHeader}>
                  <div>
                    <h3 style={styles.medicationName}>{medication.name}</h3>
                    <p style={styles.medicationDosage}>{medication.dosage} • {medication.frequency}</p>
                  </div>
                  <button style={styles.iconButton}>
                    <MoreVertical size={16} color="#6c757d" />
                  </button>
                </div>
                
                <div style={styles.medicationFooter}>
                  <div style={styles.medicationTime}>
                    <Clock size={16} />
                    Next dose: {formatTime12Hour(medication.nextTime)}
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(medication.status)
                  }}>
                    {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
