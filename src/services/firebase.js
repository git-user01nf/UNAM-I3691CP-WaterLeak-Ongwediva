import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBpMMTfFugXUuR7qUgO3Ibiep2kQH-KWHM",
  authDomain: "civi-fix13.firebaseapp.com",
  projectId: "civi-fix13",
  storageBucket: "civi-fix13.firebasestorage.app",
  messagingSenderId: "345242762024",
  appId: "1:345242762024:web:9284f25927732c444d6e1d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence (keeps user logged in)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
export default app;