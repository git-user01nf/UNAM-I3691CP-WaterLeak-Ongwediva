import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
    useEffect(() => {
    loadUserData();
  }, []);
    const loadUserData = async () => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const data = userDoc.data();
    setUserData(data);
    setProfilePic(data?.profilePic || null);
    setLoading(false);
  };
    const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadProfilePicture(result.assets[0].uri);
    }
  };
    const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadProfilePicture(result.assets[0].uri);
    }
  };
    const uploadProfilePicture = async (uri) => {
    setUploading(true);
    try {
      const userId = auth.currentUser.uid;
      
      // Fetch the image as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profilePics/${userId}`);
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Save URL to Firestore
      await updateDoc(doc(db, 'users', userId), {
        profilePic: downloadUrl,
        updatedAt: new Date().toISOString()
      });
      
      setProfilePic(downloadUrl);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            navigation.replace('Login');
          }
        }
      ]
    );
  };
    if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3c72" />
      </View>
    );
  }
    return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <View style={styles.profileImageContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {userData?.username?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <View style={styles.editIcon}>
                <Text style={styles.editIconText}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
                {/* User Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Username</Text>
            <Text style={styles.infoValue}>{userData?.username}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          {userData?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone</Text>
              <Text style={styles.infoValue}>{userData.phone}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Joined</Text>
            <Text style={styles.infoValue}>
              {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Activity</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Likes Given</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>
        </View>