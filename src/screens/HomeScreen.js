// HomeScreen.js - Updated with new colors
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Image, RefreshControl
} from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORIES, getCategoryColor } from '../utils/colors';


export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    
    const checkAdminStatus = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().isAdmin);
      }
    };
    checkAdminStatus();

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(q, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllPosts(postsData);
      filterPostsByCategory(activeTab, postsData);
      
      if (currentUser) {
        const likedStatus = {};
        for (const post of postsData) {
          const likeRef = doc(db, 'reports', post.id, 'likes', currentUser.uid);
          const likeDoc = await getDoc(likeRef);
          likedStatus[post.id] = likeDoc.exists();
        }
        setLikedPosts(likedStatus);
      }
    });

    const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
    });

    return () => {
      unsubscribePosts();
      unsubscribeAnnouncements();
    };
  }, []);

  const filterPostsByCategory = (categoryId, posts = allPosts) => {
    if (categoryId === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.category === categoryId);
      setFilteredPosts(filtered);
    }
  };

  const handleTabPress = (categoryId) => {
    setActiveTab(categoryId);
    if (categoryId === 'announcements') {
      navigation.navigate('Announcements');
    } else {
      filterPostsByCategory(categoryId);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const handleLike = async (postId, currentLikes) => {
    if (!user) return;
    if (likedPosts[postId]) return;

    try {
      const reportRef = doc(db, 'reports', postId);
      const likeRef = doc(db, 'reports', postId, 'likes', user.uid);
      
      const existingLike = await getDoc(likeRef);
      if (existingLike.exists()) {
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
        return;
      }
      
      await setDoc(likeRef, { 
        userId: user.uid,
        likedAt: new Date()
      });
      
      await updateDoc(reportRef, { likes: increment(1) });
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      
      const updatedPosts = allPosts.map(post => 
        post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      );
      setAllPosts(updatedPosts);
      filterPostsByCategory(activeTab, updatedPosts);
      
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress': return { text: '🟡 In Progress', color: COLORS.status.inProgress };
      case 'resolved': return { text: '🟢 Resolved', color: COLORS.status.resolved };
      default: return { text: '🔴 Pending', color: COLORS.status.pending };
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : '📋';
  };

  const renderPost = ({ item }) => {
    const status = getStatusBadge(item.status);
    const isLiked = likedPosts[item.id];
    const displayLikeCount = item.likes || 0;
    
    return (
      <TouchableOpacity 
        style={styles.postCard} 
        onPress={() => navigation.navigate('ReportDetail', { report: item })}
        activeOpacity={0.9}
      >
        {item.category === 'water' && (
          <View style={[styles.waterLeakBadge, { backgroundColor: COLORS.categories.water }]}>
            <Text style={styles.waterLeakBadgeText}>💧 WATER LEAK REPORT</Text>
          </View>
        )}
        
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
        
        <View style={styles.postContent}>
          <View style={styles.postHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
              <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>
          
          <Text style={styles.postDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.postFooter}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>👤 {item.username}</Text>
              <Text style={styles.postDate}>
                📅 {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <TouchableOpacity 
                onPress={() => handleLike(item.id, item.likes)} 
                style={[styles.likeButton, isLiked && styles.likedButton]}
                disabled={isLiked}
              >
                <Text style={[styles.likeText, isLiked && styles.likedButtonText]}>
                  {isLiked ? '❤️ Liked' : `❤️ ${displayLikeCount}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.commentText}>💬 {item.comments || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No reports yet</Text>
      <Text style={styles.emptyText}>Be the first to report an issue!</Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: COLORS.primary.main }]}
        onPress={() => navigation.navigate('Report', { categoryId: activeTab === 'all' ? null : activeTab })}
      >
        <Text style={styles.emptyButtonText}>➕ Report Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.primary.gradient} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Fix-Flow</Text>
            <Text style={styles.headerSubtitle}>Water Leak & Infrastructure Reporter</Text>
          </View>
          <View style={styles.headerButtons}>
            {isAdmin && (
              <TouchableOpacity onPress={() => navigation.navigate('AdminPanel')} style={styles.adminButton}>
                <Text style={styles.adminButtonText}>🏛️ Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                activeTab === category.id && styles.activeTab,
                { borderTopColor: category.color }
              ]}
              onPress={() => handleTabPress(category.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>{category.icon}</Text>
              <Text style={[
                styles.tabText,
                activeTab === category.id && styles.activeTabText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {activeTab !== 'announcements' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('Report', { categoryId: activeTab === 'all' ? null : activeTab })}
        >
          <LinearGradient
            colors={COLORS.primary.gradient}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.neutral.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.neutral.text.muted,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  adminButton: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminButtonText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutText: {
    color: COLORS.neutral.white,
    fontSize: 11,
    fontWeight: '500',
  },
  tabsWrapper: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 3,
  },
  activeTab: {
    backgroundColor: COLORS.primary.main,
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral.text.secondary,
  },
  activeTabText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: COLORS.neutral.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...COLORS.shadow.medium,
  },
  waterLeakBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  waterLeakBadgeText: {
    color: COLORS.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  postDescription: {
    fontSize: 14,
    color: COLORS.neutral.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 12,
    color: COLORS.neutral.text.muted,
  },
  postDate: {
    fontSize: 11,
    color: COLORS.neutral.text.muted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    gap: 6,
  },
  likedButton: {
    backgroundColor: COLORS.categories.safety,
  },
  likeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.categories.safety,
  },
  likedButtonText: {
    color: COLORS.neutral.white,
  },
  commentText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary.light,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.neutral.text.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  emptyButtonText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...COLORS.shadow.medium,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: COLORS.neutral.white,
    fontSize: 28,
    fontWeight: '700',
  },
});