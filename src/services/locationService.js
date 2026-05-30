import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function VerifyLocationScreen({ navigation, route }) {
  const [locationVerified, setLocationVerified] = useState(false);
  const [location, setLocation] = useState(null);

  const getCurrentLocation = () => {
    // Mock location for demo
    setLocation({ lat: -17.9167, lng: 15.7667 });
    setLocationVerified(true);
    Alert.alert('Location Verified', 'Your location has been verified successfully!');
  };

  const confirmLocation = () => {
    if (route?.params?.onLocationConfirm) {
      route.params.onLocationConfirm('Ongwediva, Namibia');
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Location</Text>
      
      {!locationVerified ? (
        <TouchableOpacity style={styles.verifyButton} onPress={getCurrentLocation}>
          <Text style={styles.verifyButtonText}>Get Current Location</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>📍 Location Verified!</Text>
          <Text style={styles.coords}>Lat: {location?.lat}, Lng: {location?.lng}</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmLocation}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#2c3e50' },
  verifyButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center' },
  verifyButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  locationInfo: { alignItems: 'center' },
  locationText: { fontSize: 20, color: '#2ecc71', marginBottom: 10 },
  coords: { fontSize: 16, color: '#34495e', marginBottom: 30 },
  confirmButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, alignItems: 'center', width: '100%' },
  confirmButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});