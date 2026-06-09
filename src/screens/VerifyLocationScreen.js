import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import * as Location from 'expo-location';

const ONGWEDIVA_LAT = -17.7833;
const ONGWEDIVA_LNG = 15.7667;
const MAX_DISTANCE_KM = 15;

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function VerifyLocationScreen({ navigation }) {
  const [status, setStatus] = useState('checking'); // checking | verified | failed | denied

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    setStatus('checking');
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setStatus('denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const distance = getDistanceKm(latitude, longitude, ONGWEDIVA_LAT, ONGWEDIVA_LNG);
      if (distance <= MAX_DISTANCE_KM) {
        setStatus('verified');
        setTimeout(() => navigation.replace('HomeScreen'), 2000);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      setStatus('failed');
    }
  };

  return (
    <View style={styles.container}>
      {status === 'checking' && (
        <>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.title}>Verifying your location...</Text>
          <Text style={styles.subtitle}>Please wait while we check you are within Ongwediva.</Text>
        </>
      )}

      {status === 'verified' && (
        <>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.title}>Location Verified!</Text>
          <Text style={styles.subtitle}>You are within Ongwediva. Redirecting...</Text>
        </>
      )}

      {status === 'failed' && (
        <>
          <View style={[styles.iconCircle, styles.iconFailed]}>
            <Text style={styles.iconText}>✕</Text>
          </View>
          <Text style={styles.title}>Outside Service Area</Text>
          <Text style={styles.subtitle}>
            You must be within 15 km of Ongwediva to submit reports.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={checkLocation}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'denied' && (
        <>
          <View style={[styles.iconCircle, styles.iconFailed]}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Location Access Denied</Text>
          <Text style={styles.subtitle}>
            Please enable location permissions in your device settings to use this app.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={checkLocation}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a6b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconFailed: {
    backgroundColor: '#e74c3c',
  },
  iconText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  subtitle: {
    color: '#a0b4d0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 28,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryText: {
    color: '#1a3a6b',
    fontSize: 15,
    fontWeight: '600',
  },
});