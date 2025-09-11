import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Firebase and other global imports
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// The environment provides these variables, so we must use them.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.match(/^c_[a-z0-9]+/)?.[0] || 'default-app-id';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Simple auth initialization function for the canvas environment
const initializeFirebaseCanvasAuth = async () => {
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Signed in with custom token.");
    } else {
      await signInAnonymously(auth);
      console.log("Signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

// --- Start of Placeholder Components to resolve import errors ---
// All components must be defined in this single file.
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
  </div>
);

const AuthForm = ({ signup }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h2 className="text-3xl font-bold text-gray-800">{signup ? "Sign Up" : "Login"} Component Placeholder</h2>
  </div>
);

const Navbar = ({ user }) => (
  <nav className="p-4 bg-gray-800 text-white flex justify-between">
    <span className="font-bold">Navbar Placeholder</span>
    <span>{user ? `User: ${user.uid}` : 'Not logged in'}</span>
  </nav>
);

const Brands = ({ user }) => (
  <div className="p-8">
    <h2 className="text-3xl font-bold">Brands Component Placeholder</h2>
  </div>
);

const AdminPanel = () => (
  <div className="p-8">
    <h2 className="text-3xl font-bold">Admin Panel Placeholder</h2>
  </div>
);

const ProfilePage = () => (
  <div className="p-8">
    <h2 className="text-3xl font-bold">Profile Page Placeholder</h2>
  </div>
);
// --- End of Placeholder Components ---

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firestoreConnectionStatus, setFirestoreConnectionStatus] = useState('Checking Firebase connection...');

  // 1. Firebase Authentication State Listener
  useEffect(() => {
    initializeFirebaseCanvasAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCheckingAuth(false);
    });
    return unsubscribeAuth;
  }, []);

  // 2. Firebase Firestore Connection Test
  useEffect(() => {
    const testFirestoreConnection = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "test"));
        querySnapshot.forEach((doc) => {
          console.log(`Firebase Firestore test doc: ${doc.id} =>`, doc.data());
        });
        setFirestoreConnectionStatus('Firebase connected');
        console.log('Firebase connected');
      } catch (error) {
        setFirestoreConnectionStatus(`Firebase connection failed: ${error.message}`);
        console.error("❌ Firebase Firestore connection error:", error);
      }
    };
    testFirestoreConnection();
  }, []);

  // Display a loading message while authentication state is being determined
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-gray-700 mb-2">Checking Authentication...</p>
        <p className="text-sm text-gray-600">{firestoreConnectionStatus}</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/brands" /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/brands" /> : <AuthForm />} />
          <Route path="/signup" element={user ? <Navigate to="/brands" /> : <AuthForm signup />} />
          <Route path="/brands" element={user ? <Brands user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

// Note: The App is now a single component.
export default App;
