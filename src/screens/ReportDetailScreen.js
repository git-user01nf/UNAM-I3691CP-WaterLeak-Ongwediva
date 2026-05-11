import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, 
  StyleSheet, Alert, TextInput, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { doc, updateDoc, increment, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportDetailScreen({ navigation, route }) {
  const { report: initialReport } = route.params;
  const [report, setReport] = useState(initialReport);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [likeCount, setLikeCount] = useState(initialReport.likes || 0);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);

    if (currentUser && initialReport.userId === currentUser.uid) {
      setIsPostOwner(true);
    }

    const checkLikeStatus = async () => {
      if (currentUser) {
        const likeRef = doc(db, 'reports', report.id, 'likes', currentUser.uid);
        const likeDoc = await getDoc(likeRef);
        setHasLiked(likeDoc.exists());
      }
    };
    checkLikeStatus();

    const reportRef = doc(db, 'reports', report.id);
    const unsubscribeReport = onSnapshot(reportRef, (doc) => {
      if (doc.exists) {
        const reportData = { id: doc.id, ...doc.data() };
        setReport(reportData);
        setLikeCount(reportData.likes || 0);
      }
    });

    const commentsQuery = query(collection(db, 'reports', report.id, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => {
      unsubscribeReport();
      unsubscribeComments();
    };
  }, [report.id]);

  const handleLike = async () => {
    if (!user) return;
    if (hasLiked) return;

    try {
      const reportRef = doc(db, 'reports', report.id);
      const likeRef = doc(db, 'reports', report.id, 'likes', user.uid);

      const existingLike = await getDoc(likeRef);
      if (existingLike.exists()) {
        setHasLiked(true);
        return;
      }

      await setDoc(likeRef, { 
        userId: user.uid,
        likedAt: serverTimestamp()
      });

      await updateDoc(reportRef, { likes: increment(1) });

      setHasLiked(true);
      setLikeCount(likeCount + 1);

    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleUnlike = async () => {
    if (!user || !hasLiked) return;

    try {
      const reportRef = doc(db, 'reports', report.id);
      const likeRef = doc(db, 'reports', report.id, 'likes', user.uid);

      await deleteDoc(likeRef);
      await updateDoc(reportRef, { likes: increment(-1) });

      setHasLiked(false);
      setLikeCount(likeCount - 1);

    } catch (error) {
      console.error('Unlike error:', error);
    }
  };

  const handleEditPost = async () => {
    if (!editTitle || !editDescription) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const reportRef = doc(db, 'reports', report.id);
      await updateDoc(reportRef, {
        title: editTitle,
        description: editDescription,
        updatedAt: serverTimestamp()
      });

      setEditMode(false);
      Alert.alert('Success', 'Post updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not update post');
    }
  };

  const handleDeletePost = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const commentsSnapshot = await getDocs(collection(db, 'reports', report.id, 'comments'));
              commentsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
              });

              const likesSnapshot = await getDocs(collection(db, 'reports', report.id, 'likes'));
              likesSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
              });

              await deleteDoc(doc(db, 'reports', report.id));

              Alert.alert('Success', 'Post deleted successfully!');
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Could not delete post');
            }
          }
        }
      ]
    );
  };

  const addComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    try {
      await addDoc(collection(db, 'reports', report.id, 'comments'), {
        userId: user.uid,
        username: user.displayName || user.email.split('@')[0],
        comment: commentText.trim(),
        createdAt: serverTimestamp()
      });

      const reportRef = doc(db, 'reports', report.id);
      await updateDoc(reportRef, { comments: increment(1) });

      setCommentText('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return '#ffc107';
      case 'resolved': return '#28a745';
      default: return '#dc3545';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress': return '🟡 In Progress';
      case 'resolved': return '🟢 Resolved';
      default: return '🔴 Pending';
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUsername}>👤 {item.username}</Text>
        <Text style={styles.commentTime}>
          {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
        </Text>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  if (editMode) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.editHeader}>
          <TouchableOpacity onPress={() => setEditMode(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>Edit Post</Text>
          <TouchableOpacity onPress={handleEditPost} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.editContainer}>
          <Text style={styles.editLabel}>Title</Text>
          <TextInput
            style={styles.editInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Enter title"
            placeholderTextColor="#999"
          />

          <Text style={styles.editLabel}>Description</Text>
          <TextInput
            style={[styles.editInput, styles.editTextArea]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Enter description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {report.imageUrl && (
          <Image source={{ uri: report.imageUrl }} style={styles.image} />
        )}

        {report.category === 'water' && (
          <View style={styles.waterLeakBadge}>
            <Text style={styles.waterLeakBadgeText}>💧 WATER LEAK REPORT</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{report.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
              <Text style={styles.statusText}>{getStatusText(report.status)}</Text>
            </View>
          </View>

          {isPostOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => {
                  setEditTitle(report.title);
                  setEditDescription(report.description);
                  setEditMode(true);
                }}
              >
                <Text style={styles.editButtonText}>✏️ Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
                <Text style={styles.deleteButtonText}>🗑️ Delete Post</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Reported by:</Text> {report.username}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Location:</Text> {report.location || 'Ongwediva'}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Date:</Text> {report.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
            </Text>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{report.description}</Text>

          {/* Video Display Section */}
          {report.videoUrl && (
            <View style={styles.mediaContainer}>
              <Text style={styles.mediaLabel}>🎥 Video Evidence</Text>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => {
                  Alert.alert('Video', 'Video evidence attached. URL: ' + report.videoUrl);
                }}
              >
                <Text style={styles.playButtonText}>▶️ Play Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Voice Note Display Section */}
          {report.voiceUrl && (
            <View style={styles.mediaContainer}>
              <Text style={styles.mediaLabel}>🎙️ Voice Note</Text>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => {
                  Alert.alert('Voice Note', 'Voice note attached. URL: ' + report.voiceUrl);
                }}
              >
                <Text style={styles.playButtonText}>🔊 Listen</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.likeContainer}>
            <TouchableOpacity 
              style={[styles.likeButton, hasLiked && styles.likedButton]} 
              onPress={hasLiked ? handleUnlike : handleLike}
            >
              <Text style={[styles.likeButtonText, hasLiked && styles.likedButtonText]}>
                {hasLiked ? '❤️ Liked' : `❤️ Like (${likeCount})`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              💬 Comments ({comments.length})
            </Text>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a public comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.commentSubmitButton} onPress={addComment}>
                <Text style={styles.commentSubmitText}>Post</Text>
              </TouchableOpacity>
            </View>

            {comments.length === 0 ? (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>💬 No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment on this report</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.commentsList}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButtonTop} onPress={() => navigation.goBack()}>
        <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.backButtonGradient}>
          <Text style={styles.backButtonText}>← Back</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  image: { width: '100%', height: 250, resizeMode: 'cover' },
  waterLeakBadge: { backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 5, position: 'absolute', top: 220, left: 15, zIndex: 10, borderRadius: 20 },
  waterLeakBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, flexWrap: 'wrap' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  ownerActions: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  editButton: { backgroundColor: '#ffc107', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  deleteButton: { backgroundColor: '#dc3545', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  metaRow: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginBottom: 15 },
  metaText: { fontSize: 12, color: '#666', marginBottom: 4 },
  metaLabel: { fontWeight: 'bold', color: '#333' },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 15 },
  mediaContainer: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginBottom: 15 },
  mediaLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  playButton: { backgroundColor: '#1e3c72', padding: 10, borderRadius: 8, alignItems: 'center' },
  playButtonText: { color: '#fff', fontWeight: 'bold' },
  likeContainer: { alignItems: 'center', marginBottom: 20 },
  likeButton: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', width: '50%' },
  likedButton: { backgroundColor: '#dc3545', borderColor: '#dc3545' },
  likeButtonText: { fontSize: 15, color: '#dc3545', fontWeight: 'bold' },
  likedButtonText: { color: '#fff' },
  commentsSection: { marginTop: 10 },
  commentsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  commentInputContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  commentInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, fontSize: 13, color: '#333', borderWidth: 1, borderColor: '#e0e0e0', minHeight: 40, maxHeight: 80 },
  commentSubmitButton: { backgroundColor: '#1e3c72', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, marginLeft: 10 },
  commentSubmitText: { color: '#fff', fontWeight: 'bold' },
  commentsList: { gap: 10 },
  commentItem: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, marginBottom: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  commentUsername: { fontSize: 12, fontWeight: 'bold', color: '#1e3c72' },
  commentTime: { fontSize: 9, color: '#999' },
  commentText: { fontSize: 13, color: '#555', lineHeight: 18 },
  noCommentsContainer: { alignItems: 'center', justifyContent: 'center', padding: 30 },
  noCommentsText: { fontSize: 14, color: '#999', marginBottom: 5 },
  noCommentsSubtext: { fontSize: 11, color: '#bbb', textAlign: 'center' },
  backButtonTop: { position: 'absolute', top: 50, left: 20 },
  backButtonGradient: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 25 },
  backButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  editHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  editContainer: { padding: 20 },
  editLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  editInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#ddd' },
  editTextArea: { height: 120, textAlignVertical: 'top' },
});