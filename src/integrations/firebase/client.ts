// Firebase client configuration
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Check if we should use emulators
const USE_EMULATOR = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' || 
                     import.meta.env.USE_FIREBASE_EMULATOR === 'true' ||
                     process.env.USE_FIREBASE_EMULATOR === 'true';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa4peFjTC7k75C_r3iUlSfgKdTbcSbZQY",
  authDomain: "spmproject-37e7a.firebaseapp.com",
  projectId: USE_EMULATOR ? "task-vantage-test" : "spmproject-37e7a",
  storageBucket: "spmproject-37e7a.firebasestorage.app",
  messagingSenderId: "440850405382",
  appId: "1:440850405382:web:6b41e7a05d2abb31798b87",
  measurementId: "G-5GFWPBZ44E"
};

// Initialize Firebase (avoid duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators if enabled
if (USE_EMULATOR) {
  try {
    // Connect Firestore Emulator
    const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 
                          import.meta.env.FIRESTORE_EMULATOR_HOST || 
                          process.env.FIRESTORE_EMULATOR_HOST ||
                          '127.0.0.1:8080';
    const [host, port] = firestoreHost.split(':');
    connectFirestoreEmulator(db, host, parseInt(port));
    console.log('✅ Connected to Firestore Emulator at', firestoreHost);
  } catch (error: any) {
    // Already connected - that's fine
    if (!error.message?.includes('already been called')) {
      console.warn('⚠️ Firestore Emulator connection issue:', error.message);
    }
  }

  try {
    // Connect Auth Emulator (if needed)
    const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || 
                     import.meta.env.AUTH_EMULATOR_HOST || 
                     process.env.AUTH_EMULATOR_HOST ||
                     '127.0.0.1:9099';
    const [host, port] = authHost.split(':');
    connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
    console.log('✅ Connected to Auth Emulator at', authHost);
  } catch (error: any) {
    // Already connected or not running - that's fine
    if (!error.message?.includes('already been called')) {
      // Auth emulator might not be running - that's okay for now
    }
  }

  try {
    // Connect Storage Emulator (if needed)
    const storageHost = import.meta.env.VITE_STORAGE_EMULATOR_HOST || 
                        import.meta.env.STORAGE_EMULATOR_HOST || 
                        process.env.STORAGE_EMULATOR_HOST ||
                        '127.0.0.1:9199';
    const [host, port] = storageHost.split(':');
    connectStorageEmulator(storage, host, parseInt(port));
    console.log('✅ Connected to Storage Emulator at', storageHost);
  } catch (error: any) {
    // Already connected or not running - that's fine
    if (!error.message?.includes('already been called')) {
      // Storage emulator might not be running - that's okay for now
    }
  }
}

// Export the app instance
export default app;

