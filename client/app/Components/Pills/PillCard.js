// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
//   Modal,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router'; // Change this import
// import { useInventory } from '../../Context/InventoryContext';

// const PillCard = ({ pill }) => {
//   // Remove the navigation line since we're using router
//   const { refillPill } = useInventory();
//   const [showRefillModal, setShowRefillModal] = useState(false);
//   const [refillAmount, setRefillAmount] = useState('');
//   const [notes, setNotes] = useState('');

//   const getStockStatus = () => {
//     if (pill.is_empty) return { status: 'empty', color: '#ef4444', label: 'Empty' };
//     if (pill.is_low_stock) return { status: 'low', color: '#f59e0b', label: 'Low Stock' };
//     return { status: 'good', color: '#10b981', label: 'Good Stock' };
//   };

//   const stockStatus = getStockStatus();
//   const fillPercentage = (pill.current_count / pill.max_capacity) * 100;
//   const maxRefillAmount = pill.max_capacity - pill.current_count;

//   const handleRefill = async () => {
//     if (!refillAmount || parseInt(refillAmount) <= 0) {
//       Alert.alert('Invalid Amount', 'Please enter a valid refill amount.');
//       return;
//     }

//     try {
//       await refillPill({
//         pill_id: pill.id,
//         quantity: parseInt(refillAmount),
//         notes
//       });
//       setShowRefillModal(false);
//       setRefillAmount('');
//       setNotes('');
//       Alert.alert('Success', 'Pill refilled successfully!');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to refill pill. Please try again.');
//     }
//   };

//   const getStatusIcon = () => {
//     switch (stockStatus.status) {
//       case 'empty':
//         return 'warning';
//       case 'low':
//         return 'alert-circle';
//       default:
//         return 'checkmark-circle';
//     }
//   };

//   return (
//     <>
//       <View style={styles.pillCard}>
//         {/* Header */}
//         <View style={styles.cardHeader}>
//           <View style={styles.pillNameContainer}>
//             <Text style={styles.pillName} numberOfLines={2}>
//               {pill.name}
//             </Text>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
//             <Ionicons name={getStatusIcon()} size={12} color="#ffffff" />
//             <Text style={styles.statusText}>
//               {pill.current_count}/{pill.max_capacity}
//             </Text>
//           </View>
//         </View>

//         {/* Progress Bar */}
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View 
//               style={[
//                 styles.progressFill,
//                 { 
//                   width: `${fillPercentage}%`, 
//                   backgroundColor: stockStatus.color 
//                 }
//               ]}
//             />
//           </View>
//           <Text style={styles.progressText}>{fillPercentage.toFixed(0)}% full</Text>
//         </View>

//         {/* Pill Info */}
//         <View style={styles.pillInfo}>
//           <View style={styles.infoRow}>
//             <Ionicons name="medical" size={16} color="#6b7280" />
//             <Text style={styles.infoLabel}>Dosage:</Text>
//             <Text style={styles.infoValue}>{pill.dosage || 'Not specified'}</Text>
//           </View>
          
//           <View style={styles.infoRow}>
//             <Ionicons name="time" size={16} color="#6b7280" />
//             <Text style={styles.infoLabel}>Frequency:</Text>
//             <Text style={styles.infoValue}>{pill.frequency || 'Not specified'}</Text>
//           </View>
          
//           {pill.compartment_number && (
//             <View style={styles.infoRow}>
//               <Ionicons name="cube" size={16} color="#6b7280" />
//               <Text style={styles.infoLabel}>Compartment:</Text>
//               <Text style={styles.infoValue}>{pill.compartment_number}</Text>
//             </View>
//           )}
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actionButtons}>
//           <TouchableOpacity 
//             style={styles.editButton}
//             onPress={() => router.push(`/pill-detail?pillId=${pill.id}`)} // Changed this line
//           >
//             <Ionicons name="create-outline" size={18} color="#4a6fa5" />
//             <Text style={styles.editButtonText}>Edit</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.refillButton}
//             onPress={() => setShowRefillModal(true)}
//           >
//             <Ionicons name="refresh" size={18} color="#f5f1e8" />
//             <Text style={styles.refillButtonText}>Refill</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Refill Modal */}
//       <Modal
//         visible={showRefillModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowRefillModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               {/* Modal Header */}
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Refill {pill.name}</Text>
//                 <TouchableOpacity 
//                   onPress={() => setShowRefillModal(false)}
//                   style={styles.closeButton}
//                 >
//                   <Ionicons name="close" size={24} color="#6b7280" />
//                 </TouchableOpacity>
//               </View>

//               {/* Current Status */}
//               <View style={styles.currentStatus}>
//                 <Text style={styles.currentStatusText}>
//                   Current: {pill.current_count} / {pill.max_capacity} pills
//                 </Text>
//                 <Text style={styles.maxRefillText}>
//                   Maximum refill: {maxRefillAmount} pills
//                 </Text>
//               </View>

//               {/* Refill Amount Input */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Amount to Add</Text>
//                 <View style={styles.inputContainer}>
//                   <TextInput
//                     style={styles.textInput}
//                     value={refillAmount}
//                     onChangeText={setRefillAmount}
//                     placeholder="Enter amount"
//                     placeholderTextColor="#9ca3af"
//                     keyboardType="numeric"
//                     maxLength={3}
//                   />
//                   <Text style={styles.inputUnit}>pills</Text>
//                 </View>
//               </View>

//               {/* Notes Input */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Notes (optional)</Text>
//                 <TextInput
//                   style={[styles.textInput, styles.notesInput]}
//                   value={notes}
//                   onChangeText={setNotes}
//                   placeholder="Add any notes about this refill..."
//                   placeholderTextColor="#9ca3af"
//                   multiline={true}
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                 />
//               </View>

//               {/* Action Buttons */}
//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={styles.cancelButton}
//                   onPress={() => setShowRefillModal(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={styles.confirmButton}
//                   onPress={handleRefill}
//                 >
//                   <Text style={styles.confirmButtonText}>Refill</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// // ... all your existing styles remain the same
// const styles = StyleSheet.create({
//   pillCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 4,
//     shadowColor: '#4a6fa5',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     borderWidth: 1,
//     borderColor: '#f3f4f6',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   pillNameContainer: {
//     flex: 1,
//     marginRight: 12,
//   },
//   pillName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#4a6fa5',
//     lineHeight: 24,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 4,
//     overflow: 'hidden',
//     marginBottom: 4,
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#6b7280',
//     fontWeight: '500',
//     textAlign: 'right',
//   },
//   pillInfo: {
//     marginBottom: 16,
//     gap: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   infoLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6b7280',
//     minWidth: 70,
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#374151',
//     flex: 1,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   editButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 10,
//     backgroundColor: '#f5f1e8',
//     borderWidth: 1,
//     borderColor: '#4a6fa5',
//     gap: 6,
//   },
//   editButtonText: {
//     color: '#4a6fa5',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   refillButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 10,
//     backgroundColor: '#4a6fa5',
//     gap: 6,
//   },
//   refillButtonText: {
//     color: '#f5f1e8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//   },
//   modalContainer: {
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 24,
//     maxHeight: '80%',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#4a6fa5',
//     flex: 1,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   currentStatus: {
//     backgroundColor: '#f9fafb',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   currentStatusText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 4,
//   },
//   maxRefillText: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f9fafb',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   textInput: {
//     flex: 1,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: '#374151',
//   },
//   inputUnit: {
//     paddingRight: 16,
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   notesInput: {
//     height: 80,
//     backgroundColor: '#f9fafb',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     paddingTop: 14,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 8,
//   },
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: '#f3f4f6',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6b7280',
//   },
//   confirmButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: '#4a6fa5',
//     alignItems: 'center',
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#f5f1e8',
//   },
// });

// export default PillCard;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PillCard = () => {
  return (
    <View>
      <Text>PillCard</Text>
    </View>
  )
}

export default PillCard

const styles = StyleSheet.create({})