// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your components
import Brands from "./pages/Brands";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

// Import your Firebase instances
import { auth, db } from "./firebase"; // Make sure db is imported if used in a test elsewhere
import { collection, getDocs } from "firebase/firestore"; // For the Firebase connection test if you keep it

// Fallback UI for any unmatched routes
const NotFound = () => (
  <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Page Not Found</h2>
);

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firestoreConnectionStatus, setFirestoreConnectionStatus] = useState('Checking Firebase connection...');

  // 1. Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      setCheckingAuth(false); // Authentication check is complete
    });
    // Clean up the subscription when the component unmounts
    return unsubscribeAuth;
  }, []);

  // 2. Firebase Firestore Connection Test (Modified for better UX)
  useEffect(() => {
    const testFirestoreConnection = async () => {
      try {
        // Attempt a simple read to confirm connection
        // It's good practice to ensure your 'test' collection exists and has appropriate rules
        const querySnapshot = await getDocs(collection(db, "test"));
        querySnapshot.forEach((doc) => {
          // Log data from the 'test' collection, but don't alert the user
          console.log(`Firebase Firestore test doc: ${doc.id} =>`, doc.data());
        });
        setFirestoreConnectionStatus('✅ Firebase Firestore connected successfully.');
        console.log('✅ Firebase Firestore connected successfully.'); // Log to console for dev
      } catch (error) {
        setFirestoreConnectionStatus(`❌ Firebase Firestore connection failed: ${error.message}`);
        console.error("❌ Firebase Firestore connection error:", error);
      }
    };

    // Run the Firestore test only once after component mounts
    testFirestoreConnection();
  }, []); // Empty dependency array means this runs once on mount

  // Display a loading message while authentication state is being determined
  if (checkingAuth) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Checking authentication...</p>
        <p>{firestoreConnectionStatus}</p> {/* Show Firestore status during loading */}
      </div>
    );
  }

  // Once authentication is checked, render the main application with routing
  return (
    <Router>
      {/* Navbar will always be visible */}
      <Navbar user={user} />

      {/* Routes define which component to render based on the URL */}
      <Routes>
        {/* Root path: Redirects based on authentication status */}
        <Route
          path="/"
          element={user ? <Navigate to="/brands" /> : <Navigate to="/login" />}
        />

        {/* Login/Signup paths: Redirects if already authenticated */}
        <Route
          path="/login"
          element={user ? <Navigate to="/brands" /> : <AuthForm />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/brands" /> : <AuthForm signup />}
        />

        {/* Protected Routes: Only accessible if user is logged in */}
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
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />

        {/* Fallback route for any undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
