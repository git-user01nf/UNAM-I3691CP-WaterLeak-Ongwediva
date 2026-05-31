eact, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [leakCount, setLeakCount] = useState(0);
  const [userName, setUserName] = useState('Resident');

  useEffect(() => {
    // Simulate fetching user data
    fetchLeakStats();
  }, []);

  const fetchLeakStats = async () => {
    // Mock API call
    setTimeout(() => {
      setLeakCount(5);
    }, 1000);
  };

  const handleReportLeak = () => {
    navigation.navigate('ReportScreen');
  };

  const handleViewReports = () => {
    navigation.navigate('ReportScreen');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Text style={styles.subtitle}>Water Leak Management System</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{leakCount}</Text>
        <Text style={styles.statsLabel}>Active Leaks Reported</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleReportLeak}>
        <Text style={styles.buttonText}>Report New Water Leak</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleViewReports}>
        <Text style={styles.secondaryButtonText}>View All Reports</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📢 Emergency: Call +264 61 123 456</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#007bff', alignItems: 'center' },
  welcomeText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  statsCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10, alignItems: 'center', elevation: 3 },
  statsNumber: { fontSize: 48, color: '#007bff', fontWeight: 'bold' },
  statsLabel: { fontSize: 16, color: '#666', marginTop: 5 },
  primaryButton: { backgroundColor: '#007bff', margin: 10, padding: 15, borderRadius: 8, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#007bff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButtonText: { color: '#007bff', fontSize: 16 },
  infoBox: { backgroundColor: '#ffc107', margin: 20, padding: 15, borderRadius: 8, alignItems: 'center' },
  infoText: { fontSize: 14, color: '#333', fontWeight: 'bold' }
});

export default HomeScreen;