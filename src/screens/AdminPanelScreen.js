import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function AdminPanelScreen() {
  const [reports, setReports] = useState([
    { id: '1', location: 'Main Street 123', status: 'pending', user: 'john@email.com' },
    { id: '2', location: 'Oak Avenue 45', status: 'in-progress', user: 'jane@email.com' },
    { id: '3', location: 'Pine Road 78', status: 'pending', user: 'bob@email.com' },
  ]);

  const updateStatus = (id, newStatus) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: newStatus } : report
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Panel</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.user}>Reported by: {item.user}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.statusButton, styles.pending]} onPress={() => updateStatus(item.id, 'pending')}>
                <Text style={styles.buttonText}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, styles.inProgress]} onPress={() => updateStatus(item.id, 'in-progress')}>
                <Text style={styles.buttonText}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, styles.resolved]} onPress={() => updateStatus(item.id, 'resolved')}>
                <Text style={styles.buttonText}>Resolved</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  reportCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  location: { fontSize: 18, fontWeight: 'bold', color: '#34495e' },
  user: { fontSize: 14, color: '#7f8c8d', marginTop: 5 },
  status: { fontSize: 14, marginTop: 5, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statusButton: { flex: 1, padding: 8, marginHorizontal: 3, borderRadius: 8, alignItems: 'center' },
  pending: { backgroundColor: '#e74c3c' },
  inProgress: { backgroundColor: '#f39c12' },
  resolved: { backgroundColor: '#2ecc71' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});