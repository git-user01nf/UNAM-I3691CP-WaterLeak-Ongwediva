import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { auth } from '../services/firebase';
import {
  requestNotificationPermissions,
  getExpoPushToken,
  savePushTokenToFirestore,
  addNotificationListener,
  addNotificationResponseListener,
} from '../services/notificationService';

export const useNotifications = () => {
  const [notification, setNotification] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // Request permissions
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;

      // Get Expo push token
      const expoToken = await getExpoPushToken();
      setExpoPushToken(expoToken);

      // Save token to Firestore when user is logged in
      const user = auth.currentUser;
      if (user && expoToken) {
        await savePushTokenToFirestore(user.uid, expoToken);
      }

      // Listen for foreground notifications
      const notificationListener = addNotificationListener((notification) => {
        setNotification(notification);
        // Show alert in foreground
        Alert.alert(
          notification.request.content.title,
          notification.request.content.body
        );
      });

      // Listen for when user taps on notification
      const responseListener = addNotificationResponseListener((response) => {
        console.log('Notification tapped:', response);
        // You can navigate to specific screen here
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  return { expoPushToken, notification };
};