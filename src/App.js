// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Correct path to your i18n config
import { useTranslation } from 'react-i18next';

// Import your components
import Brands from "./pages/Brands";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage"; // THIS LINE IS CRUCIAL: Ensure it's exactly './pages/ProfilePage'

// Import your Firebase instances and initialization function
import { auth, db, collection, getDocs, initializeFirebaseCanvasAuth } from "./firebase";

// Fallback UI for any unmatched routes
const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800">{t('pageNotFound')}</h2>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firestoreConnectionStatus, setFirestoreConnectionStatus] = useState('Checking Firebase connection...');
  const { t } = useTranslation();

  // 1. Firebase Authentication State Listener
  useEffect(() => {
    initializeFirebaseCanvasAuth();

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
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
        setFirestoreConnectionStatus(t('firebaseConnected'));
        console.log(t('firebaseConnected'));
      } catch (error) {
        setFirestoreConnectionStatus(t('firebaseConnectionFailed', { message: error.message }));
        console.error("❌ Firebase Firestore connection error:", error);
      }
    };

    testFirestoreConnection();
  }, [t]);

  // Display a loading message while authentication state is being determined
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-gray-700 mb-2">{t('checkingAuthentication')}</p>
        <p className="text-sm text-gray-600">{firestoreConnectionStatus}</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/brands" /> : <Navigate to="/login" />}
          />

          <Route
            path="/login"
            element={user ? <Navigate to="/brands" /> : <AuthForm />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/brands" /> : <AuthForm signup />}
          />

          <Route
            path="/brands"
            element={user ? <Brands user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user ? <AdminPanel /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

// Wrap the App component with I18nextProvider
function WrappedApp() {
  return (
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  );
}

export default WrappedApp;
