import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBpMMTfFugXUuR7qUgO3Ibiep2kQH-KWHM',
  authDomain: 'civi-fix13.firebaseapp.com',
  projectId: 'civi-fix13',
  storageBucket: 'civi-fix13.firebasestorage.app',
  messagingSenderId: '345242762024',
  appId: '1:345242762024:web:9284f25927732c444d6e1d',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();

export const loginWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return signOut(auth);
};

export default auth;
