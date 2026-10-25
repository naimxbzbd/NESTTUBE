import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore (using the provisioned databaseId)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Contextual error handler following Firebase skill specifications
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export interface FirestoreErrorPayload {
  error: string;
  operationType: OperationType;
  path: string;
  authUid?: string;
  authEmail?: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string): never {
  const currentUser = auth.currentUser;
  const payload: FirestoreErrorPayload = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authUid: currentUser?.uid,
    authEmail: currentUser?.email || undefined,
  };
  console.error('[Firestore Permission / Execution Error]', payload);
  throw new Error(JSON.stringify(payload));
}

export {
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
};
export type { FirebaseUser };
