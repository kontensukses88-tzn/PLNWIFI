/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  getDocFromServer,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StrukItem, StoreConfig } from '../types';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let currentOAuthAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
  if (currentOAuthAccessToken) return currentOAuthAccessToken;
  return localStorage.getItem('google_access_token');
};

export const setAccessToken = (token: string | null) => {
  currentOAuthAccessToken = token;
  if (token) {
    localStorage.setItem('google_access_token', token);
  } else {
    localStorage.removeItem('google_access_token');
  }
};

/**
 * Perform Google Sign-In via Popup
 */
export async function googleSignIn(): Promise<UserCredential | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setAccessToken(credential.accessToken);
    }
    return result;
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw error;
  }
}

/**
 * Logout User
 */
export async function logoutUser(): Promise<void> {
  setAccessToken(null);
  await signOut(auth);
}

/**
 * Auth State Listener
 */
export function initAuth(onUserChange: (user: User | null) => void, onError?: (err: any) => void) {
  return onAuthStateChanged(auth, (user) => {
    onUserChange(user);
  }, (err) => {
    if (onError) onError(err);
  });
}

/**
 * Save Receipt to Firestore Collection
 */
export async function saveReceiptToFirestore(item: StrukItem): Promise<void> {
  try {
    const receiptRef = doc(db, 'struk_history', item.id);
    await setDoc(receiptRef, {
      ...item,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore save warning (saving locally as fallback):', error);
  }
}

/**
 * Delete Receipt from Firestore
 */
export async function deleteReceiptFromFirestore(id: string): Promise<void> {
  try {
    const receiptRef = doc(db, 'struk_history', id);
    await deleteDoc(receiptRef);
  } catch (error) {
    console.warn('Firestore delete warning:', error);
  }
}

/**
 * Clear All Receipts from Firestore
 */
export async function clearAllReceiptsFromFirestore(): Promise<void> {
  try {
    const q = collection(db, 'struk_history');
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore clear all warning:', error);
  }
}

/**
 * Realtime Subscribe to Receipts Collection
 */
export function subscribeToReceipts(onData: (receipts: StrukItem[]) => void) {
  try {
    const q = query(collection(db, 'struk_history'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: StrukItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as StrukItem);
      });
      onData(items);
    }, (error) => {
      console.warn('Firestore subscription error:', error);
    });
  } catch (err) {
    console.warn('Firestore query error:', err);
    return () => {};
  }
}

/**
 * Save Store Settings to Firestore
 */
export async function saveStoreConfigToFirestore(config: StoreConfig): Promise<void> {
  try {
    const configRef = doc(db, 'store_settings', 'default_config');
    await setDoc(configRef, {
      ...config,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore config save warning:', error);
  }
}

/**
 * Subscribe to Store Settings
 */
export function subscribeToStoreConfig(onData: (config: StoreConfig) => void) {
  try {
    const configRef = doc(db, 'store_settings', 'default_config');
    return onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as StoreConfig);
      }
    }, (error) => {
      console.warn('Firestore config subscription error:', error);
    });
  } catch (err) {
    console.warn('Firestore config query error:', err);
    return () => {};
  }
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
