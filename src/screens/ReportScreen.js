// ReportScreen.js - Updated with new colors
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { uploadToCloudinary, uploadVideoToCloudinary, uploadAudioToCloudinary } from '../services/cloudinary';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES, getCategoryColor } from '../utils/colors';

// Cloudinary configuration (MOVE TO .env)
const CLOUD_NAME = 'dlbjuvumj';
const UPLOAD_PRESET = 'ongwediva_reports';

const sendPushNotificationToAllUsers = async (title, body, reportData) => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const tokens = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.pushToken && userData.pushToken !== '' && userData.pushToken !== null) {
        tokens.push(userData.pushToken);
      }
    });
    
    if (tokens.length === 0) {
      console.log('No users with push tokens found');
      return;
    }
    
    console.log(`Sending notifications to ${tokens.length} users`);
    
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        reportId: reportData.id || '',
        category: reportData.category,
        screen: 'Home'
      }
    }));
    
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      await Promise.all(batch.map(async (message) => {
        try {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });
          const data = await response.json();
          if (data.errors) {
            console.error('Push notification error:', data.errors);
          }
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }));
    }
    
    console.log('All push notifications sent');
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
};

export default function ReportScreen({ navigation, route }) {
  const { categoryId } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'water');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permissions');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setVoiceNote(uri);
    setRecording(null);
  };

  const removeVoiceNote = () => {
    setVoiceNote(null);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;
      let videoUrl = null;
      let voiceUrl = null;

      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');

      if (image) {
        imageUrl = await uploadToCloudinary(image);
        console.log('Uploaded to Cloudinary:', imageUrl);
      }

      if (video) {
        videoUrl = await uploadVideoToCloudinary(video);
        console.log('Uploaded video to Cloudinary:', videoUrl);
      }

      if (voiceNote) {
        voiceUrl = await uploadAudioToCloudinary(voiceNote);
        console.log('Uploaded voice note to Cloudinary:', voiceUrl);
      }

      const reportData = {
        title,
        description,
        location: location || 'Ongwediva',
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        voiceUrl: voiceUrl,
        category: selectedCategory,
        userId: user.uid,
        username: user.displayName || user.email.split('@')[0],
        status: 'pending',
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'reports'), reportData);
      
      const categoryIcon = {
        'water': '💧',
        'roads': '🛣️',
        'sanitation': '🗑️',
        'safety': '🛡️',
        'environment': '🌿'
      }[selectedCategory] || '📋';
      
      await sendPushNotificationToAllUsers(
        `${categoryIcon} New ${selectedCategory} Report`,
        `${title} - by ${user.displayName || user.email.split('@')[0]}`,
        { id: docRef.id, category: selectedCategory }
      );

      Alert.alert('Success', 'Report submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.primary.gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report an Issue</Text>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Category *</Text>
            <View style={styles.categorySelector}>
              {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'announcements').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === cat.id && { backgroundColor: cat.color }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    selectedCategory === cat.id && styles.categoryOptionTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter issue title"
              placeholderTextColor={COLORS.neutral.text.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue in detail"
              placeholderTextColor={COLORS.neutral.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
            />
          </View>

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter specific location"
              placeholderTextColor={COLORS.neutral.text.muted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Image Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Image (Optional)</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImage}>
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Video Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Video (Optional)</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={recordVideo}>
                <Text style={styles.imageButtonText}>🎥 Record Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickVideo}>
                <Text style={styles.imageButtonText}>📁 Choose Video</Text>
              </TouchableOpacity>
            </View>

            {video && (
              <View style={styles.imagePreview}>
                <Text style={styles.mediaText}>📹 Video selected</Text>
                <TouchableOpacity onPress={() => setVideo(null)} style={styles.removeImage}>
                  <Text style={styles.removeImageText}>Remove Video</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Voice Note Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Voice Note (Optional)</Text>
            <View style={styles.imageButtons}>
              {!isRecording ? (
                <TouchableOpacity style={styles.imageButton} onPress={startRecording}>
                  <Text style={styles.imageButtonText}>🎤 Start Recording</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.imageButton, styles.recordingButton]} onPress={stopRecording}>
                  <Text style={styles.imageButtonText}>⏹️ Stop Recording</Text>
                </TouchableOpacity>
              )}
            </View>

            {voiceNote && (
              <View style={styles.imagePreview}>
                <Text style={styles.mediaText}>🎙️ Voice note recorded</Text>
                <TouchableOpacity onPress={removeVoiceNote} style={styles.removeImage}>
                  <Text style={styles.removeImageText}>Remove Voice Note</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: getCategoryColor(selectedCategory) }]}
            onPress={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.neutral.white} />
            ) : (
              <Text style={styles.submitText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  back: { marginBottom: 16, padding: 4 },
  backText: { color: COLORS.neutral.white, fontSize: 16, fontWeight: '600' },
  card: { 
    backgroundColor: COLORS.neutral.white, 
    borderRadius: 28, 
    padding: 24, 
    ...COLORS.shadow.medium 
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: COLORS.primary.main, 
    textAlign: 'center', 
    marginBottom: 24 
  },
  inputGroup: { marginBottom: 20 },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.neutral.text.secondary, 
    marginBottom: 8 
  },
  categorySelector: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  categoryOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 30, 
    backgroundColor: '#F1F5F9', 
    gap: 8 
  },
  categoryOptionIcon: { fontSize: 16 },
  categoryOptionText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.neutral.text.secondary 
  },
  categoryOptionTextSelected: { 
    color: COLORS.neutral.white, 
    fontWeight: '600' 
  },
  input: { 
    backgroundColor: '#F1F5F9', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: COLORS.neutral.text.primary, 
    borderWidth: 1, 
    borderColor: COLORS.neutral.border 
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  imageButtons: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 6 
  },
  imageButton: { 
    backgroundColor: COLORS.neutral.text.muted, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    flex: 1, 
    alignItems: 'center' 
  },
  imageButtonText: { 
    color: COLORS.neutral.white, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  recordingButton: { 
    backgroundColor: COLORS.categories.safety 
  },
  imagePreview: { 
    alignItems: 'center', 
    marginTop: 16 
  },
  previewImage: { 
    width: '100%', 
    height: 200, 
    borderRadius: 16, 
    marginBottom: 12 
  },
  removeImage: { 
    backgroundColor: COLORS.categories.safety, 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 20 
  },
  removeImageText: { 
    color: COLORS.neutral.white, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  mediaText: { 
    fontSize: 14, 
    color: COLORS.neutral.text.secondary, 
    marginBottom: 8 
  },
  submitButton: { 
    paddingVertical: 16, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 16 
  },
  submitText: { 
    color: COLORS.neutral.white, 
    fontSize: 16, 
    fontWeight: '600' 
  }
});