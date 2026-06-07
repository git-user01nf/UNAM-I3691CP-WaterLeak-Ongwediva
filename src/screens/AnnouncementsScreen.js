import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ScrollView
} from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    
    // Check admin status
    const checkAdmin = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().isAdmin);
      }
    };
    checkAdmin();

    // Fetch announcements
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data);
    });

    return () => unsubscribe();
  }, []);

  const createAnnouncement = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        content,
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || 'Admin',
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setModalVisible(false);
      Alert.alert('Success', 'Announcement posted!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderAnnouncement = ({ item }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementIcon}>📢</Text>
        <Text style={styles.announcementTitle}>{item.title}</Text>
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <Text style={styles.announcementMeta}>
        Posted by: {item.createdByName} • {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Public Announcements</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No announcements yet</Text>
          </View>
        }
      />

      {/* Create Announcement Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Announcement content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={createAnnouncement}>
                <Text style={styles.submitButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backButton: { padding: 5 },
  backText: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 15 },
  announcementCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  announcementHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  announcementIcon: { fontSize: 24, marginRight: 10 },
  announcementTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  announcementContent: { fontSize: 14, color: '#666', marginBottom: 8 },
  announcementMeta: { fontSize: 11, color: '#999' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 50 },
  emptyText: { color: '#999', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15 },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cancelButton: { flex: 1, backgroundColor: '#e9ecef', padding: 12, borderRadius: 10, alignItems: 'center' },
  submitButton: { flex: 1, backgroundColor: '#1e3c72', padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelButtonText: { color: '#333' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
});