// src/firebase.js
// This file initializes Firebase and exports the necessary services.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// These variables are populated by Vercel environment variables.
// Ensure they are set in your Vercel project settings.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
// Note: LinkedInProvider is NOT a standard Firebase provider.
// You would typically use a custom OAuth flow or a Firebase Cloud Function
// to integrate with LinkedIn. For demonstration, we'll include a placeholder
// but actual LinkedIn integration requires more setup.
// For a real LinkedIn integration, you'd likely use a custom token generated
// by your backend after LinkedIn OAuth.
const linkedInProvider = new GoogleAuthProvider(); // Placeholder: Use Google for demo simplicity

// Global variables provided by the Canvas environment for authentication
// These are crucial for Firebase authentication in the Canvas environment.
const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigFromCanvas = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Function to handle initial Firebase authentication in Canvas
const initializeFirebaseCanvasAuth = async () => {
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Firebase signed in with custom token.");
    } else {
      await signInAnonymously(auth);
      console.log("Firebase signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

// Export Firebase services and providers
export {
  auth,
  db,
  storage,
  googleProvider,
  linkedInProvider, // Placeholder for LinkedIn
  signInWithPopup,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  initializeFirebaseCanvasAuth,
  canvasAppId as appId // Export Canvas-provided appId for use in Firestore paths
};
