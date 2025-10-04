// Firebase client configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa4peFjTC7k75C_r3iUlSfgKdTbcSbZQY",
  authDomain: "spmproject-37e7a.firebaseapp.com",
  projectId: "spmproject-37e7a",
  storageBucket: "spmproject-37e7a.firebasestorage.app",
  messagingSenderId: "440850405382",
  appId: "1:440850405382:web:6b41e7a05d2abb31798b87",
  measurementId: "G-5GFWPBZ44E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;

