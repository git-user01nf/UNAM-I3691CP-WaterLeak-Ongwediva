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
        <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => updatePostStatus(item.id, 'pending')}>
          <Text style={styles.actionButtonText}>🟡 Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => updatePostStatus(item.id, 'in_progress')}>
          <Text style={styles.actionButtonText}>🔵 In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={() => updatePostStatus(item.id, 'resolved')}>
          <Text style={styles.actionButtonText}>🟢 Resolved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => openEditModal(item)}>
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deletePost(item.id)}>
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
