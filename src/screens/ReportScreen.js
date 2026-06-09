import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CATEGORIES = ['Water Leaks', 'Roads', 'Sanitation', 'Safety', 'Environment'];
const MAX_DESC = 500;

export default function ReportScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water Leaks');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow location access.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setLocation({ lat: latitude, lng: longitude });

      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const parts = [address.street, address.district, address.city].filter(Boolean);
        setLocationAddress(parts.join(', '));
      } else {
        setLocationAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description.');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();
      await addDoc(collection(db, 'reports'), {
        title,
        description,
        category,
        imageUrl: image || null,
        status: 'Pending',
        username: user?.displayName || user?.email || 'Anonymous',
        userId: user?.uid || null,
        location: location || null,
        locationAddress: locationAddress || null,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Your report has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Report</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Pipe burst on Main Street"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={[
              styles.charCount,
              description.length > MAX_DESC * 0.9 && { color: '#e74c3c' }
            ]}>
              {description.length}/{MAX_DESC}
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={text => text.length <= MAX_DESC && setDescription(text)}
          />

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={getLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#1a3a6b" />
            ) : (
              <Text style={styles.locationBtnText}>
                {location ? '📍 Location captured' : '📍 Get my current location'}
              </Text>
            )}
          </TouchableOpacity>

          {locationAddress ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>📌 {locationAddress}</Text>
              <Text style={styles.locationCoords}>
                {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
              </Text>
              <TouchableOpacity onPress={() => { setLocation(null); setLocationAddress(''); }}>
                <Text style={styles.clearLocation}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.label}>Photo (optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Tap to add a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {image && (
            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageBtn}>
              <Text style={styles.removeImageText}>✕ Remove photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Report</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#1a3a6b',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { color: '#fff', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  body: { padding: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  charCount: { fontSize: 12, color: '#888' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryRow: { marginBottom: 4 },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#1a3a6b',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  categoryChipActive: { backgroundColor: '#1a3a6b' },
  categoryChipText: { color: '#1a3a6b', fontSize: 13 },
  categoryChipTextActive: { color: '#fff' },
  locationBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1a3a6b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  locationBtnText: { color: '#1a3a6b', fontSize: 14, fontWeight: '600' },
  locationInfo: {
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  locationAddress: { fontSize: 13, color: '#1a3a6b', fontWeight: '600', marginBottom: 2 },
  locationCoords: { fontSize: 11, color: '#555', marginBottom: 6 },
  clearLocation: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  previewImage: { width: '100%', height: 180 },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: { fontSize: 32, marginBottom: 8 },
  imagePlaceholderText: { color: '#aaa', fontSize: 13 },
  removeImageBtn: { alignItems: 'center', marginTop: 6 },
  removeImageText: { color: '#e74c3c', fontSize: 13 },
  submitBtn: {
    backgroundColor: '#1a3a6b',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});