import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBpMMTfFugXUuR7qUgO3Ibiep2kQH-KWHM",
  authDomain: "civi-fix13.firebaseapp.com",
  projectId: "civi-fix13",
  storageBucket: "civi-fix13.firebasestorage.app",
  messagingSenderId: "345242762024",
  appId: "1:345242762024:web:9284f25927732c444d6e1d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
