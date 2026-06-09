import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, ScrollView, Modal
} from 'react-native';
import {
  getFirestore, collection, getDocs, orderBy, query,
  updateDoc, doc, addDoc, serverTimestamp
} from 'firebase/firestore';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const STATUS_COLORS = {
  Pending: { bg: '#fce4e4', text: '#c0392b' },
  'In Progress': { bg: '#fff3cd', text: '#856404' },
  Resolved: { bg: '#d4edda', text: '#155724' },
};

export default function AdminPanelScreen({ navigation }) {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPostedBy, setAnnPostedBy] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'reports', reportId), { status: newStatus });
      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      );
      setModalVisible(false);
      Alert.alert('Updated', `Status changed to ${newStatus}`);
    } catch {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const handlePostAnnouncement = async () => {
    if (!annTitle || !annMessage) {
      Alert.alert('Error', 'Please fill in title and message.');
      return;
    }
    setPosting(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'announcements'), {
        title: annTitle,
        message: annMessage,
        postedBy: annPostedBy || 'Town Council',
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Announcement posted!');
      setAnnTitle('');
      setAnnMessage('');
      setAnnPostedBy('');
    } catch {
      Alert.alert('Error', 'Failed to post announcement.');
    } finally {
      setPosting(false);
    }
  };

  const renderReport = ({ item }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS['Pending'];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status || 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.cardMeta}>👤 {item.username || 'Anonymous'}</Text>
        <TouchableOpacity
          style={styles.changeStatusBtn}
          onPress={() => { setSelectedReport(item); setModalVisible(true); }}
        >
          <Text style={styles.changeStatusText}>Change Status</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'reports' && styles.tabBtnActive]}
          onPress={() => setTab('reports')}
        >
          <Text style={[styles.tabBtnText, tab === 'reports' && styles.tabBtnTextActive]}>
            Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'announcements' && styles.tabBtnActive]}
          onPress={() => setTab('announcements')}
        >
          <Text style={[styles.tabBtnText, tab === 'announcements' && styles.tabBtnTextActive]}>
            Post Announcement
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'reports' ? (
        loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1a3a6b" />
        ) : reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No reports yet</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={item => item.id}
            renderItem={renderReport}
            contentContainerStyle={styles.list}
            onRefresh={fetchReports}
            refreshing={loading}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.annForm}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Announcement title"
            placeholderTextColor="#aaa"
            value={annTitle}
            onChangeText={setAnnTitle}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your announcement..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            value={annMessage}
            onChangeText={setAnnMessage}
          />

          <Text style={styles.label}>Posted By (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ongwediva Town Council"
            placeholderTextColor="#aaa"
            value={annPostedBy}
            onChangeText={setAnnPostedBy}
          />

          <TouchableOpacity
            style={[styles.postBtn, posting && { opacity: 0.7 }]}
            onPress={handlePostAnnouncement}
            disabled={posting}
          >
            {posting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.postBtnText}>Post Announcement</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Status</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {selectedReport?.title}
            </Text>
            {STATUSES.map(s => {
              const sc = STATUS_COLORS[s];
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, { backgroundColor: sc.bg }]}
                  onPress={() => handleStatusChange(selectedReport.id, s)}
                >
                  <Text style={[styles.statusOptionText, { color: sc.text }]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#1a3a6b' },
  tabBtnText: { fontSize: 14, color: '#888' },
  tabBtnTextActive: { color: '#1a3a6b', fontWeight: '600' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 14, marginBottom: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardCategory: { fontSize: 12, color: '#1a3a6b', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 6 },
  cardMeta: { fontSize: 12, color: '#888', marginBottom: 10 },
  changeStatusBtn: {
    borderWidth: 1, borderColor: '#1a3a6b',
    borderRadius: 6, paddingVertical: 7, alignItems: 'center',
  },
  changeStatusText: { color: '#1a3a6b', fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  annForm: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#333',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  postBtn: {
    backgroundColor: '#1a3a6b', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
    marginTop: 24, marginBottom: 40,
  },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 16,
    borderTopRightRadius: 16, padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#888', marginBottom: 16 },
  statusOption: {
    borderRadius: 8, paddingVertical: 13,
    alignItems: 'center', marginBottom: 10,
  },
  statusOptionText: { fontSize: 15, fontWeight: '600' },
  cancelBtn: {
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8,
  },
  cancelBtnText: { fontSize: 15, color: '#888' },
});