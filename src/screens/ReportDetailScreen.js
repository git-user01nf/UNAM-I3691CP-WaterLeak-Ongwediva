import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ReportDetailScreen({ route, navigation }) {
  const { report } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.location}>{report.location}</Text>
        <Text style={[styles.status, { color: report.status === 'pending' ? '#e74c3c' : report.status === 'in-progress' ? '#f39c12' : '#2ecc71' }]}>
          Status: {report.status.toUpperCase()}
        </Text>
        <Text style={styles.date}>Reported: {report.timestamp}</Text>
        <Text style={styles.description}>Description: Water leak reported at this location. Crew has been notified.</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
  location: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  status: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 14, color: '#7f8c8d', marginBottom: 15 },
  description: { fontSize: 16, color: '#34495e', lineHeight: 24, marginBottom: 30 },
  button: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
