// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import PillCard from '../Components/Pills/PillCard'
// import { useInventory } from '../Context/InventoryContext';

// const Main = () => {
//   const { pills, loading } = useInventory();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   const filterOptions = [
//     { key: 'all', label: 'All Status', count: pills.length },
//     { key: 'good', label: 'Good Stock', count: pills.filter(p => !p.is_low_stock && !p.is_empty).length },
//     { key: 'low', label: 'Low Stock', count: pills.filter(p => p.is_low_stock).length },
//     { key: 'empty', label: 'Empty', count: pills.filter(p => p.is_empty).length },
//   ];

//   const filteredPills = pills.filter(pill => {
//     const matchesSearch = pill.name.toLowerCase().includes(searchTerm.toLowerCase());
    
//     if (filterStatus === 'all') return matchesSearch;
//     if (filterStatus === 'low') return matchesSearch && pill.is_low_stock;
//     if (filterStatus === 'empty') return matchesSearch && pill.is_empty;
//     if (filterStatus === 'good') return matchesSearch && !pill.is_low_stock && !pill.is_empty;
    
//     return matchesSearch;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'good': return '#10b981';
//       case 'low': return '#f59e0b';
//       case 'empty': return '#ef4444';
//       default: return '#4a6fa5';
//     }
//   };

//   const renderPillItem = ({ item }) => (
//     <View style={styles.pillCardContainer}>
//       <PillCard pill={item} />
//     </View>
//   );

//   const renderFilterModal = () => (
//     <View style={styles.filterModal}>
//       <View style={styles.filterContent}>
//         <View style={styles.filterHeader}>
//           <Text style={styles.filterTitle}>Filter by Status</Text>
//           <TouchableOpacity onPress={() => setShowFilterModal(false)}>
//             <Ionicons name="close" size={24} color="#4a6fa5" />
//           </TouchableOpacity>
//         </View>
        
//         {filterOptions.map((option) => (
//           <TouchableOpacity
//             key={option.key}
//             style={[
//               styles.filterOption,
//               filterStatus === option.key && styles.filterOptionActive
//             ]}
//             onPress={() => {
//               setFilterStatus(option.key);
//               setShowFilterModal(false);
//             }}
//           >
//             <View style={styles.filterOptionContent}>
//               <Text style={[
//                 styles.filterOptionText,
//                 filterStatus === option.key && styles.filterOptionTextActive
//               ]}>
//                 {option.label}
//               </Text>
//               <View style={[
//                 styles.filterBadge,
//                 { backgroundColor: getStatusColor(option.key) }
//               ]}>
//                 <Text style={styles.filterBadgeText}>{option.count}</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4a6fa5" />
//           <Text style={styles.loadingText}>Loading pills...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>All Pills ({pills.length})</Text>
//         <Text style={styles.subtitle}>Manage your medication inventory</Text>
//       </View>

//       {/* Search and Filter */}
//       <View style={styles.searchFilterContainer}>
//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search pills..."
//             placeholderTextColor="#9ca3af"
//             value={searchTerm}
//             onChangeText={setSearchTerm}
//           />
//         </View>
        
//         <TouchableOpacity 
//           style={styles.filterButton}
//           onPress={() => setShowFilterModal(true)}
//         >
//           <Ionicons name="filter" size={20} color="#f5f1e8" />
//         </TouchableOpacity>
//       </View>

//       {/* Active Filter Indicator */}
//       {filterStatus !== 'all' && (
//         <View style={styles.activeFilterContainer}>
//           <View style={[styles.activeFilterBadge, { backgroundColor: getStatusColor(filterStatus) }]}>
//             <Text style={styles.activeFilterText}>
//               {filterOptions.find(f => f.key === filterStatus)?.label}
//             </Text>
//             <TouchableOpacity onPress={() => setFilterStatus('all')}>
//               <Ionicons name="close-circle" size={16} color="#f5f1e8" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Pills List */}
//       {filteredPills.length > 0 ? (
//         <FlatList
//           data={filteredPills}
//           renderItem={renderPillItem}
//           keyExtractor={(item) => item.id.toString()}
//           numColumns={2}
//           contentContainerStyle={styles.pillsList}
//           columnWrapperStyle={styles.pillsRow}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.emptyState}>
//           <Ionicons name="medical" size={64} color="#9ca3af" />
//           <Text style={styles.emptyTitle}>No pills found</Text>
//           <Text style={styles.emptySubtitle}>
//             Try adjusting your search or filter criteria.
//           </Text>
//           {searchTerm || filterStatus !== 'all' ? (
//             <TouchableOpacity 
//               style={styles.clearFiltersButton}
//               onPress={() => {
//                 setSearchTerm('');
//                 setFilterStatus('all');
//               }}
//             >
//               <Text style={styles.clearFiltersText}>Clear filters</Text>
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       )}

//       {/* Filter Modal */}
//       {showFilterModal && renderFilterModal()}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f1e8', // bamboo
//   },
//   header: {
//     paddingHorizontal: 24,
//     paddingTop: 20,
//     paddingBottom: 16,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#4a6fa5', // denim
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#6b7280',
//     fontWeight: '400',
//   },
//   searchFilterContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 24,
//     marginBottom: 16,
//     gap: 12,
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     elevation: 2,
//     shadowColor: '#4a6fa5',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   searchIcon: {
//     marginRight: 12,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: '#374151',
//   },
//   filterButton: {
//     backgroundColor: '#4a6fa5', // denim
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#4a6fa5',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   activeFilterContainer: {
//     paddingHorizontal: 24,
//     marginBottom: 16,
//   },
//   activeFilterBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 8,
//   },
//   activeFilterText: {
//     color: '#f5f1e8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   pillsList: {
//     paddingHorizontal: 24,
//     paddingBottom: 20,
//   },
//   pillsRow: {
//     justifyContent: 'space-between',
//   },
//   pillCardContainer: {
//     flex: 1,
//     marginBottom: 16,
//     marginHorizontal: 4,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#4a6fa5',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   clearFiltersButton: {
//     marginTop: 20,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     backgroundColor: '#4a6fa5',
//     borderRadius: 20,
//   },
//   clearFiltersText: {
//     color: '#f5f1e8',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   filterModal: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   filterContent: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 24,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   filterHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   filterTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#4a6fa5',
//   },
//   filterOption: {
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 8,
//     backgroundColor: '#f9fafb',
//   },
//   filterOptionActive: {
//     backgroundColor: '#4a6fa5',
//   },
//   filterOptionContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   filterOptionText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#374151',
//   },
//   filterOptionTextActive: {
//     color: '#f5f1e8',
//   },
//   filterBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     minWidth: 24,
//     alignItems: 'center',
//   },
//   filterBadgeText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
// });

// export default Main;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Main = () => {
  return (
    <View>
      <Text>Main</Text>
    </View>
  )
}

export default Main

const styles = StyleSheet.create({})