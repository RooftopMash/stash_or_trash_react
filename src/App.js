import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

// Mock Components and data to make the app self-contained
const Navbar = ({ user }) => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      {/* Logo updated to use a direct path from the public folder */}
      <div className="flex items-center space-x-2">
        <img src="/assets/app-logo.png" alt="App Logo" className="h-8 w-8" />
        <div className="font-bold text-xl">My App</div>
      </div>
      <div>
        {user ? (
          <span className="text-sm">Logged in as {user.email || 'Guest'}</span>
        ) : (
          <span className="text-sm">Not logged in</span>
        )}
      </div>
    </div>
  </nav>
);

const AuthForm = ({ signup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const auth = getAuth();
    try {
      if (signup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{signup ? "Sign Up" : "Log In"}</h2>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <p className="text-gray-600">This is a placeholder for the authentication form. Since the app is now a single file, full authentication logic is not included here.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200" 
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition-all duration-200" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            {signup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
      </div>
    </div>
  );
};

const Brands = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Brands Page</h2>
    <p>Welcome, {user.email || "Guest"}! This is a placeholder for the Brands page content.</p>
  </div>
);

const AdminPanel = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
    <p>This is a placeholder for the admin panel content.</p>
  </div>
);

const ProfilePage = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Profile Page</h2>
    <p>This is a placeholder for the user profile page. User ID: {user.uid}</p>
  </div>
);

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
    </div>
  );
};

// Simplified Firebase Logic
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// Sanitize the appId to use a valid format for a Firestore document ID
const appId = rawAppId.match(/^c_[a-z0-9]+/)?.[0] || 'default-app-id';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [firestoreConnectionStatus, setFirestoreConnectionStatus] = useState('Checking Firebase connection...');

  // 1. Firebase Authentication State Listener and Firestore Test
  useEffect(() => {
    initializeFirebaseCanvasAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setCheckingAuth(false);

      if (user) {
        try {
          // Use a private user-specific collection for testing
          const testCollectionRef = collection(db, "artifacts", appId, "users", user.uid, "test");
          const querySnapshot = await getDocs(testCollectionRef);
          querySnapshot.forEach((doc) => {
            console.log(`Firebase Firestore test doc: ${doc.id} =>`, doc.data());
          });
          setFirestoreConnectionStatus('Firebase is connected!');
          console.log('Firebase is connected!');
        } catch (error) {
          setFirestoreConnectionStatus(`Firebase connection failed: ${error.message}`);
          console.error("❌ Firebase Firestore connection error:", error);
        }
      } else {
        setFirestoreConnectionStatus('Not signed in, skipping Firestore connection test.');
      }
    });

    return unsubscribeAuth;
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

// Wrapping App in a mock I18nextProvider for compilation
const MockI18nextProvider = ({ children }) => <>{children}</>;

function WrappedApp() {
  return (
    <MockI18nextProvider>
      <App />
    </MockI18nextProvider>
  );
}

export default WrappedApp;
