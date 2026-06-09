// src/services/uploadService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import * as ImageManipulator from 'expo-image-manipulator';

// Generate unique filename
const generateUniqueFilename = (originalName, type) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName?.split('.').pop() || (type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'm4a');
  return `${type}_${timestamp}_${randomString}.${extension}`;
};

// Compress image before upload
export const compressImage = async (uri) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
};

// Upload image to Firebase Storage
export const uploadImageToFirebase = async (imageUri, userId) => {
  try {
    const compressedUri = await compressImage(imageUri);
    
    // Fetch the file as blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    // Create filename and reference
    const filename = generateUniqueFilename('image.jpg', 'image');
    const storageRef = ref(storage, `reports/${userId}/${filename}`);
    
    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Upload video to Firebase Storage
export const uploadVideoToFirebase = async (videoUri, userId) => {
  try {
    // Fetch the file as blob
    const response = await fetch(videoUri);
    const blob = await response.blob();
    
    // Create filename and reference
    const filename = generateUniqueFilename('video.mp4', 'video');
    const storageRef = ref(storage, `reports/${userId}/${filename}`);
    
    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
};

// Upload audio/voice note to Firebase Storage
export const uploadAudioToFirebase = async (audioUri, userId) => {
  try {
    // Fetch the file as blob
    const response = await fetch(audioUri);
    const blob = await response.blob();
    
    // Create filename and reference
    const filename = generateUniqueFilename('audio.m4a', 'audio');
    const storageRef = ref(storage, `reports/${userId}/${filename}`);
    
    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error('Audio upload error:', error);
    throw error;
  }
};