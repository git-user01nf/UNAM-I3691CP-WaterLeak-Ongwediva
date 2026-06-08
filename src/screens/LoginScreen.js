// LoginScreen.js - Updated with new colors
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful:', user.email);
      navigation.replace('VerifyLocation');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.primary.gradient} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>💧</Text>
          </View>
          <Text style={styles.title}>Fix-Flow</Text>
          <Text style={styles.subtitle}>Water Leak & Infrastructure Reporter</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.neutral.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.neutral.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.neutral.white} /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Create Account →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    alignItems: 'center', 
    marginTop: 80, 
    marginBottom: 40 
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '700', 
    color: COLORS.neutral.white,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 14, 
    color: COLORS.neutral.text.muted, 
    marginTop: 8,
    textAlign: 'center',
  },
  card: { 
    backgroundColor: COLORS.neutral.white, 
    marginHorizontal: 20, 
    padding: 24, 
    borderRadius: 32, 
    ...COLORS.shadow.medium 
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 24, 
    color: COLORS.primary.main 
  },
  input: { 
    backgroundColor: '#F1F5F9', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16,
    color: COLORS.neutral.text.primary,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  button: { 
    backgroundColor: COLORS.primary.main, 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { 
    color: COLORS.neutral.white, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  linkText: { 
    textAlign: 'center', 
    marginTop: 20, 
    color: COLORS.primary.main, 
    fontSize: 14, 
    fontWeight: '600' 
  },
});