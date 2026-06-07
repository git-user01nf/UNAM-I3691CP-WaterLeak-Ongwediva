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