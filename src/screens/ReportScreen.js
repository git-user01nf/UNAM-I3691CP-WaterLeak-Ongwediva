import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { uploadToCloudinary, uploadVideoToCloudinary, uploadAudioToCloudinary } from '../services/cloudinary';
import { LinearGradient } from 'expo-linear-gradient';

// Cloudinary configuration
const CLOUD_NAME = 'dlbjuvumj';
const UPLOAD_PRESET = 'ongwediva_reports';

// Categories for selection
const CATEGORIES = [
  { id: 'water', name: '💧 Water Leaks', icon: '💧', color: '#2196F3' },
  { id: 'roads', name: '🛣️ Roads', icon: '🛣️', color: '#9C27B0' },
  { id: 'sanitation', name: '🗑️ Sanitation', icon: '🗑️', color: '#4CAF50' },
  { id: 'safety', name: '🛡️ Safety', icon: '🛡️', color: '#F44336' },
  { id: 'environment', name: '🌿 Environment', icon: '🌿', color: '#8BC34A' }
];

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

  // Image functions
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

  // Video functions
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

  // Voice recording functions
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

      await addDoc(collection(db, 'reports'), reportData);

      Alert.alert('Success', 'Report submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const getCategoryColor = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? cat.color : '#2196F3';
  };

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
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
              {CATEGORIES.map((cat) => (
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              <ActivityIndicator color="#fff" />
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
  scroll: { flexGrow: 1, padding: 20 },
  back: { marginBottom: 15, padding: 5 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e3c72', textAlign: 'center', marginBottom: 20 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  categorySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30, backgroundColor: '#f0f0f0', gap: 6 },
  categoryOptionIcon: { fontSize: 16 },
  categoryOptionText: { fontSize: 13, color: '#333', fontWeight: '500' },
  categoryOptionTextSelected: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageButtons: { flexDirection: 'row', gap: 12, marginTop: 5 },
  imageButton: { backgroundColor: '#6c757d', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, flex: 1, alignItems: 'center' },
  imageButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  recordingButton: { backgroundColor: '#dc3545' },
  imagePreview: { alignItems: 'center', marginTop: 15 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  removeImage: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  removeImageText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  mediaText: { fontSize: 14, color: '#333', marginBottom: 8 },
  submitButton: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});