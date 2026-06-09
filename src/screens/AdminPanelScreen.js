import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Modal, TextInput, ScrollView
} from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminPanelScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    // Listen to reports
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    });

    // Listen to announcements
    const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
      setLoading(false);
    });

    return () => {
      unsubscribeReports();
      unsubscribeAnnouncements();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const updatePostStatus = async (postId, newStatus) => {
    try {
      await updateDoc(doc(db, 'reports', postId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      Alert.alert('Success', 'Status updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deletePost = async (postId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'reports', postId));
              Alert.alert('Success', 'Post deleted!');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const editPost = async () => {
    if (!editingPost) return;
    
    try {
      await updateDoc(doc(db, 'reports', editingPost.id), {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        updatedAt: serverTimestamp(),
        editedBy: 'admin'
      });
      
      // Add admin comment about edit
      await addDoc(collection(db, 'reports', editingPost.id, 'comments'), {
        userId: auth.currentUser.uid,
        username: '🏛️ Town Council Admin',
        comment: `📝 Post has been edited by administrator. New status: ${editStatus}`,
        createdAt: serverTimestamp(),
        isAuto: true
      });
      
      Alert.alert('Success', 'Post updated!');
      setEditModalVisible(false);
      setEditingPost(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const createAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'announcements'), {
        title: announcementTitle,
        content: announcementContent,
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || 'Admin',
        createdAt: serverTimestamp(),
        isUrgent: false
      });
      
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setModalVisible(false);
      Alert.alert('Success', 'Announcement posted!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    Alert.alert(
      'Confirm Delete',
      'Delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'announcements', announcementId));
              Alert.alert('Success', 'Announcement deleted!');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditStatus(post.status || 'pending');
    setEditModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return '#ffc107';
      case 'resolved': return '#28a745';
      default: return '#dc3545';
    }
  };

  const renderReport = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'pending'}</Text>
        </View>
      </View>
      <Text style={styles.postMeta}>By: {item.username}</Text>
      <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => updatePostStatus(item.id, 'pending')}>
          <Text style={styles.actionButtonText}>🟡 Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => updatePostStatus(item.id, 'in_progress')}>
          <Text style={styles.actionButtonText}>🔵 In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => updatePostStatus(item.id, 'resolved')}>
          <Text style={styles.actionButtonText}>🟢 Resolved</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}>
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deletePost(item.id)}>
          <Text style={styles.actionButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnnouncement = ({ item }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteAnnouncement(item.id)}>
          <Text style={styles.deleteAnnouncement}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <Text style={styles.announcementMeta}>Posted by: {item.createdByName}</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏛️ Town Council Admin Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}>
          <Text style={styles.tabText}>📋 Reports ({reports.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
          onPress={() => setActiveTab('announcements')}>
          <Text style={styles.tabText}>📢 Announcements ({announcements.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'reports' ? (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No reports yet</Text>}
        />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>➕ Create Announcement</Text>
          </TouchableOpacity>
          <FlatList
            data={announcements}
            renderItem={renderAnnouncement}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No announcements yet</Text>}
          />
        </>
      )}

      {/* Create Announcement Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={announcementTitle}
              onChangeText={setAnnouncementTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Announcement content"
              value={announcementContent}
              onChangeText={setAnnouncementContent}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={createAnnouncement}>
                <Text style={styles.submitButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
            />
            <View style={styles.statusOptions}>
              <Text style={styles.statusLabel}>Status:</Text>
              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'pending' && styles.statusOptionActive]}
                onPress={() => setEditStatus('pending')}>
                <Text>🟡 Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'in_progress' && styles.statusOptionActive]}
                onPress={() => setEditStatus('in_progress')}>
                <Text>🔵 In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'resolved' && styles.statusOptionActive]}
                onPress={() => setEditStatus('resolved')}>
                <Text>🟢 Resolved</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={editPost}>
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoutButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  logoutText: { color: '#fff' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15 },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.4)' },
  tabText: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 15 },
  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  postTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 15 },
  statusText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  postMeta: { fontSize: 12, color: '#666', marginBottom: 8 },
  postDescription: { fontSize: 14, color: '#333', marginBottom: 12 },
  postActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusButton: { backgroundColor: '#e9ecef' },
  editButton: { backgroundColor: '#ffc107' },
  deleteButton: { backgroundColor: '#dc3545' },
  actionButtonText: { fontSize: 11, fontWeight: 'bold' },
  addButton: { backgroundColor: '#28a745', margin: 15, padding: 12, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  announcementCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12 },
  announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  announcementTitle: { fontSize: 16, fontWeight: 'bold' },
  deleteAnnouncement: { fontSize: 18 },
  announcementContent: { fontSize: 14, color: '#333', marginBottom: 8 },
  announcementMeta: { fontSize: 12, color: '#666' },
  emptyText: { textAlign: 'center', color: '#fff', marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15 },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#e9ecef' },
  submitButton: { backgroundColor: '#1e3c72' },
  cancelButtonText: { color: '#333' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  statusOptions: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' },
  statusLabel: { marginRight: 10, fontWeight: 'bold' },
  statusOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e9ecef', marginRight: 8 },
  statusOptionActive: { backgroundColor: '#1e3c72' },
});