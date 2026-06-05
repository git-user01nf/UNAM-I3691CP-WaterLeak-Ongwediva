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
=======
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password) return alert('Fill all fields');
    alert('Account created successfully');
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Full Name" style={styles.input} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:20 },
  title:{ fontSize:28, fontWeight:'bold', marginBottom:20 },
  input:{ borderWidth:1, padding:12, marginBottom:12, borderRadius:8 },
  btn:{ backgroundColor:'#007bff', padding:15, borderRadius:8 },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'bold' }
>>>>>>> 96d5980ddfc9b22c2fd5108ac0c852dd9b4dd083
});
