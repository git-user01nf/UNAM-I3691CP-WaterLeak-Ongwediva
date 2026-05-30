import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const mockReports = [
      { id: '1', location: 'Main Street 123', status: 'pending', timestamp: '2024-01-15' },
      { id: '2', location: 'Oak Avenue 45', status: 'in-progress', timestamp: '2024-01-14' },
      { id: '3', location: 'Pine Road 78', status: 'resolved', timestamp: '2024-01-13' },
    ];
    setReports(mockReports);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#e74c3c';
      case 'in-progress': return '#f39c12';
      case 'resolved': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Water Leak Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
          >
            <Text style={styles.location}>{item.location}</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
            <Text style={styles.date}>{item.timestamp}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  reportCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  location: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  status: { fontSize: 12, marginTop: 5, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#7f8c8d', marginTop: 5 }
});