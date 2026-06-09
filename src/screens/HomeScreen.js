import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Image, ActivityIndicator, Alert
} from 'react-native';
import { logout } from '../services/firebase';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';

const CATEGORIES = ['All Posts', 'Water Leaks', 'Roads', 'Sanitation', 'Safety', 'Environment'];

const CATEGORY_ICONS = {
  'All Posts': '📋',
  'Water Leaks': '💧',
  'Roads': '🏗️',
  'Sanitation': '🗑️',
  'Safety': '🛡️',
  'Environment': '🌿',
};

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All Posts');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    } catch (error) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const filteredReports = activeCategory === 'All Posts'
    ? reports
    : reports.filter(r => r.category === activeCategory);

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReportDetailScreen', { report: item })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {CATEGORY_ICONS[item.category] || '📋'} {item.category?.toUpperCase() || 'REPORT'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{item.status || 'Pending'}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>👤 {item.username || 'Anonymous'}</Text>
          <Text style={styles.cardMeta}>
            📅 {item.createdAt?.toDate?.().toLocaleDateString() || ''}
          </Text>
          <View style={styles.cardActions}>
            <Text style={styles.actionText}>❤️ {item.likes || 0}</Text>
            <Text style={styles.actionText}>💬 {item.comments || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fix-Flow</Text>
          <Text style={styles.headerSubtitle}>Water Leak & Infrastructure Reporter</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.tabActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                {CATEGORY_ICONS[cat]} {cat}
              </Text>
              {activeCategory === cat && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1a3a6b" />
      ) : filteredReports.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📬</Text>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to report an issue!</Text>
          <TouchableOpacity
            style={styles.reportNowBtn}
            onPress={() => navigation.navigate('ReportScreen')}
          >
            <Text style={styles.reportNowText}>+ Report Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={item => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ReportScreen')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#a0b4d0', fontSize: 12, marginTop: 2 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#fff', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  logoutText: { color: '#fff', fontSize: 13 },
  tabsWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tabs: { paddingHorizontal: 8, paddingVertical: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 4, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: '#1a3a6b', fontWeight: '600' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 8, right: 8,
    height: 2, backgroundColor: '#1a3a6b', borderRadius: 1,
  },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, marginBottom: 14,
    overflow: 'hidden', elevation: 2,
  },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999', fontSize: 13 },
  cardBody: { padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryBadge: {
    backgroundColor: '#e8f0fe', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  categoryBadgeText: { fontSize: 11, color: '#1a3a6b', fontWeight: '600' },
  statusBadge: {
    backgroundColor: '#fce4e4', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusBadgeText: { fontSize: 11, color: '#c0392b', fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cardMeta: { fontSize: 12, color: '#888' },
  cardActions: { flexDirection: 'row', gap: 10, marginLeft: 'auto' },
  actionText: { fontSize: 12, color: '#888' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  reportNowBtn: {
    backgroundColor: '#1a3a6b', borderRadius: 25,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  reportNowText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#1a75ff', width: 52, height: 52,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});