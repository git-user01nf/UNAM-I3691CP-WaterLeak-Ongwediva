import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function ReportScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = () => {
    if (!location || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Water leak reported successfully!');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Water Leak</Text>
      
      <Text style={styles.label}>Location</Text>
      <TouchableOpacity style={styles.locationButton} onPress={() => navigation.navigate('VerifyLocation')}>
        <Text style={styles.locationButtonText}>{location || 'Tap to verify location'}</Text>
      </TouchableOpacity>
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe the water leak..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      
      <Text style={styles.label}>Severity</Text>
      <View style={styles.severityContainer}>
        <TouchableOpacity style={[styles.severityButton, severity === 'low' && styles.severitySelected]} onPress={() => setSeverity('low')}>
          <Text style={styles.severityText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.severityButton, severity === 'medium' && styles.severitySelected]} onPress={() => setSeverity('medium')}>
          <Text style={styles.severityText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.severityButton, severity === 'high' && styles.severitySelected]} onPress={() => setSeverity('high')}>
          <Text style={styles.severityText}>High</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#34495e' },
  locationButton: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  locationButtonText: { color: '#3498db' },
  textArea: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', height: 100, textAlignVertical: 'top' },
  severityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  severityButton: { flex: 1, padding: 12, marginHorizontal: 5, borderRadius: 10, backgroundColor: '#ecf0f1', alignItems: 'center' },
  severitySelected: { backgroundColor: '#3498db' },
  severityText: { fontWeight: 'bold' },
  submitButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});