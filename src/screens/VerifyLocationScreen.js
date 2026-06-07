import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { isWithinOngwediva, MAX_DISTANCE_KM, ONGWEDIVA_COORDINATES } from '../services/locationService';

export default function VerifyLocationScreen({ navigation }) {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    setVerifying(true);
    setError(null);
    
    try {
      const isValid = await isWithinOngwediva();
      
      if (isValid) {
        setVerified(true);
        setVerifying(false);
        // Auto proceed after 2 seconds
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000);
      } else {
        setVerified(false);
        setVerifying(false);
      }
    } catch (err) {
      setError(err.message);
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.title}>Verifying Location...</Text>
          <Text style={styles.message}>Please wait while we verify your location</Text>
        </View>
      </LinearGradient>
    );
  }

  if (verified) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.iconText}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Location Verified!</Text>
          <Text style={styles.message}>You are within Ongwediva. Redirecting...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.errorIcon}>
          <Text style={styles.iconText}>📍</Text>
        </View>
        <Text style={styles.errorTitle}>Location Not Verified</Text>
        <Text style={styles.message}>
          You must be within {MAX_DISTANCE_KM}km of Ongwediva to use this app.
        </Text>
        <Text style={styles.coordinates}>
          Ongwediva coordinates: {ONGWEDIVA_COORDINATES.latitude}, {ONGWEDIVA_COORDINATES.longitude}
        </Text>
        <Text style={styles.radius}>
          Maximum distance allowed: {MAX_DISTANCE_KM}km
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  coordinates: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  radius: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 10,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(40,167,69,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220,53,69,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  retryButtonText: {
    color: '#1e3c72',
    fontSize: 16,
    fontWeight: 'bold',
  },
});