<<<<<<< HEAD
import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';

// Simple Register Screen (Admin Panel - Register)
export default function AdminPanelScreen({navigation}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const validateEmail = (em) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    };

    const onRegister = () => {
        if (!name.trim() || !email.trim() || !password) {
            return Alert.alert('Validation', 'Please fill all required fields');
        }
        if (!validateEmail(email)) {
            return Alert.alert('Validation', 'Please enter a valid email');
        }
        if (password.length < 6) {
            return Alert.alert('Validation', 'Password must be at least 6 characters');
        }
        if (password !== confirm) {
            return Alert.alert('Validation', 'Passwords do not match');
        }

        // Placeholder: replace with API call or navigation logic
        Alert.alert('Success', `Registered ${name} (${email})`);
        // navigation.goBack();
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Register Admin</Text>

                <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
                <TextInput placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} style={styles.input} secureTextEntry />

                <TouchableOpacity style={styles.button} onPress={onRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation && navigation.goBack()} style={styles.link}>
                    <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    inner: {padding: 24, alignItems: 'stretch', justifyContent: 'center', flexGrow: 1},
    title: {fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center'},
    input: {borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12},
    button: {backgroundColor: '#007bff', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 8},
    buttonText: {color: '#fff', fontWeight: '600'},
    link: {marginTop: 16, alignItems: 'center'},
    linkText: {color: '#007bff'},
});
=======
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
>>>>>>> 96d5980ddfc9b22c2fd5108ac0c852dd9b4dd083
