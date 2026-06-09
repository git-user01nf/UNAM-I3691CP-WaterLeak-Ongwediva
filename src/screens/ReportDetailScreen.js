import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, TextInput, ActivityIndicator, Share
} from 'react-native';
import { getFirestore, doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

const STATUS_COLORS = {
  Pending: { bg: '#fce4e4', text: '#c0392b' },
  'In Progress': { bg: '#fff3cd', text: '#856404' },
  Resolved: { bg: '#d4edda', text: '#155724' },
};

const CATEGORY_ICONS = {
  'Water Leaks': '💧',
  'Roads': '🏗️',
  'Sanitation': '🗑️',
  'Safety': '🛡️',
  'Environment': '🌿',
};

export default function ReportDetailScreen({ route, navigation }) {
  const { report } = route.params;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(report.likes || 0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentStatusIndex = STATUS_STEPS.indexOf(report.status || 'Pending');

  const handleLike = async () => {
    if (liked) return;
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'reports', report.id), { likes: increment(1) });
      setLikes(prev => prev + 1);
      setLiked(true);
    } catch {
      Alert.alert('Error', 'Failed to like report.');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();
      await addDoc(collection(db, 'reports', report.id, 'comments'), {
        text: comment.trim(),
        username: user?.displayName || user?.email || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'reports', report.id), { comments: increment(1) });
      setComment('');
      Alert.alert('Success', 'Comment posted!');
    } catch {
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: report.title,
        message:
          `📋 ${report.title}\n` +
          `📍 Category: ${report.category}\n` +
          `📝 ${report.description}\n` +
          `🔄 Status: ${report.status || 'Pending'}\n` +
          `👤 Reported by: ${report.username || 'Anonymous'}\n\n` +
          `Shared via Fix-Flow — Infrastructure Reporter`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share this report.');
    }
  };

  const statusStyle = STATUS_COLORS[report.status] || STATUS_COLORS['Pending'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareBtn}>Share 🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {report.imageUrl ? (
          <Image source={{ uri: report.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_ICONS[report.category] || '📋'} {report.category?.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                {report.status || 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.description}>{report.description}</Text>

          {report.locationAddress && (
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>📌 {report.locationAddress}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.meta}>👤 {report.username || 'Anonymous'}</Text>
            <Text style={styles.meta}>
              📅 {report.createdAt?.toDate?.().toLocaleDateString() || ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Report Status</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotActive,
                      index === currentStatusIndex && styles.timelineDotCurrent,
                    ]}>
                      {isCompleted && <Text style={styles.timelineDotCheck}>✓</Text>}
                    </View>
                    {!isLast && (
                      <View style={[styles.timelineLine, isCompleted && index < currentStatusIndex && styles.timelineLineActive]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, isCompleted && styles.timelineLabelActive]}>
                      {step}
                    </Text>
                    {index === currentStatusIndex && (
                      <Text style={styles.timelineCurrent}>Current status</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.likeBtn, liked && styles.likeBtnActive]}
              onPress={handleLike}
            >
              <Text style={[styles.likeBtnText, liked && styles.likeBtnTextActive]}>
                ❤️ {likes} {liked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareActionBtn} onPress={handleShare}>
              <Text style={styles.shareActionText}>🔗 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Leave a Comment</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#aaa"
            multiline
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={[styles.commentBtn, submitting && { opacity: 0.7 }]}
            onPress={handleComment}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.commentBtnText}>Post Comment</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  shareBtn: { color: '#fff', fontSize: 13 },
  image: { width: '100%', height: 220 },
  imagePlaceholder: {
    width: '100%', height: 180,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center',
  },
  imagePlaceholderText: { color: '#999', fontSize: 13 },
  body: { paddingBottom: 40 },
  content: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  categoryBadge: {
    backgroundColor: '#e8f0fe', borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryBadgeText: { fontSize: 11, color: '#1a3a6b', fontWeight: '600' },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 12 },
  locationRow: {
    backgroundColor: '#e8f0fe', borderRadius: 8,
    padding: 10, marginBottom: 12,
  },
  locationText: { fontSize: 13, color: '#1a3a6b' },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  meta: { fontSize: 12, color: '#888' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  likeBtn: {
    flex: 1, borderWidth: 1, borderColor: '#1a3a6b',
    borderRadius: 20, paddingVertical: 9, alignItems: 'center',
  },
  likeBtnActive: { backgroundColor: '#1a3a6b' },
  likeBtnText: { color: '#1a3a6b', fontSize: 13 },
  likeBtnTextActive: { color: '#fff' },
  shareActionBtn: {
    flex: 1, borderWidth: 1, borderColor: '#1a3a6b',
    borderRadius: 20, paddingVertical: 9, alignItems: 'center',
  },
  shareActionText: { color: '#1a3a6b', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 16, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 16 },
  timeline: { marginBottom: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 14 },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotActive: { borderColor: '#1a3a6b', backgroundColor: '#1a3a6b' },
  timelineDotCurrent: { borderColor: '#1a75ff', backgroundColor: '#1a75ff' },
  timelineDotCheck: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#ddd', marginVertical: 2 },
  timelineLineActive: { backgroundColor: '#1a3a6b' },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineLabel: { fontSize: 14, color: '#aaa', fontWeight: '500' },
  timelineLabelActive: { color: '#1a3a6b', fontWeight: '600' },
  timelineCurrent: { fontSize: 11, color: '#1a75ff', marginTop: 2 },
  commentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  commentBtn: {
    backgroundColor: '#1a3a6b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  commentBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
