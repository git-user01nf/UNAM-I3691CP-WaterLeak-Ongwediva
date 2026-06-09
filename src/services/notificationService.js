import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  return true;
};

// Get Expo push token (works on both Android and iOS)
export const getExpoPushToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log('Expo Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// Save token to Firestore
export const savePushTokenToFirestore = async (userId, token) => {
  if (!userId || !token) return;
  
  try {
    await setDoc(doc(db, 'users', userId), {
      pushToken: token,
      tokenUpdatedAt: new Date().toISOString(),
      tokenPlatform: Platform.OS
    }, { merge: true });
    
    console.log('Push token saved to Firestore for user:', userId);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Listen for notifications when app is in foreground
export const addNotificationListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Listen for when user taps on notification
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Send a test notification (for debugging)
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Fix-Flow Test",
      body: "Notifications are working!",
    },
    trigger: null, // Send immediately
  });
};