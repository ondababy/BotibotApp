// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { pillService } from '../Services/api'; // Updated path to match your structure

// const InventoryContext = createContext();

// export const useInventory = () => {
//   const context = useContext(InventoryContext);
//   if (!context) {
//     throw new Error('useInventory must be used within an InventoryProvider');
//   }
//   return context;
// };

// export const InventoryProvider = ({ children }) => {
//   const [pills, setPills] = useState([]);
//   const [summary, setSummary] = useState({});
//   const [lowStockPills, setLowStockPills] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchPills = async () => {
//     try {
//       setLoading(true);
//       const response = await pillService.getAllPills();
//       setPills(response.data.pills);
//     } catch (err) {
//       setError('Failed to fetch pills');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSummary = async () => {
//     try {
//       const response = await pillService.getInventorySummary();
//       setSummary(response.data.summary);
//     } catch (err) {
//       console.error('Failed to fetch summary:', err);
//     }
//   };

//   const fetchLowStockPills = async () => {
//     try {
//       const response = await pillService.getLowStockPills();
//       setLowStockPills(response.data.low_stock_pills);
//     } catch (err) {
//       console.error('Failed to fetch low stock pills:', err);
//     }
//   };

//   const addPill = async (pillData) => {
//     try {
//       const response = await pillService.addPill(pillData);
//       if (response.data.success) {
//         await fetchPills();
//         await fetchSummary();
//         return response.data;
//       }
//     } catch (err) {
//       throw err;
//     }
//   };

//   const refillPill = async (refillData) => {
//     try {
//       const response = await pillService.refillPills(refillData);
//       if (response.data.success) {
//         await fetchPills();
//         await fetchSummary();
//         await fetchLowStockPills();
//         return response.data;
//       }
//     } catch (err) {
//       throw err;
//     }
//   };

//   const adjustInventory = async (adjustData) => {
//     try {
//       const response = await pillService.adjustInventory(adjustData);
//       if (response.data.success) {
//         await fetchPills();
//         await fetchSummary();
//         return response.data;
//       }
//     } catch (err) {
//       throw err;
//     }
//   };

//   useEffect(() => {
//     fetchPills();
//     fetchSummary();
//     fetchLowStockPills();
//   }, []);

//   const value = {
//     pills,
//     summary,
//     lowStockPills,
//     loading,
//     error,
//     fetchPills,
//     fetchSummary,
//     fetchLowStockPills,
//     addPill,
//     refillPill,
//     adjustInventory,
//   };

//   return (
//     <InventoryContext.Provider value={value}>
//       {children}
//     </InventoryContext.Provider>
//   );
// };

// export default InventoryProvider;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const InventoryContext = () => {
  return (
    <View>
      <Text>InventoryContext</Text>
    </View>
  )
}

export default InventoryContext

const styles = StyleSheet.create({})