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
});
