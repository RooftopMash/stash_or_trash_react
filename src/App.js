import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Helper function to check for Firebase globals and initialize
const initializeFirebaseCanvasAuth = () => {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (typeof __initial_auth_token !== 'undefined') {
    signInWithCustomToken(auth, __initial_auth_token).catch((error) => {
      console.error("Firebase Auth Error:", error);
    });
  } else {
    signInAnonymously(auth).catch((error) => {
      console.error("Firebase Auth Error:", error);
    });
  }

  return { auth, db };
};

// Navbar Component
const Navbar = ({ user, setPage }) => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center rounded-lg">
      <h1 className="text-xl font-bold text-gray-800">Stash or Trash</h1>
      <div className="space-x-4">
        <button onClick={() => setPage('brands')} className="text-gray-600 hover:text-gray-900 font-semibold transition-colors duration-200">Brands</button>
        {user ? (
          <button onClick={() => setPage('profile')} className="text-gray-600 hover:text-gray-900 font-semibold transition-colors duration-200">Profile</button>
        ) : (
          <button onClick={() => setPage('login')} className="text-gray-600 hover:text-gray-900 font-semibold transition-colors duration-200">Login</button>
        )}
      </div>
    </nav>
  );
};

// AuthForm Component
const AuthForm = ({ setPage, signup }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{signup ? 'Sign Up' : 'Login'}</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            {signup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          {signup ? (
            <p className="text-sm text-gray-600">Already have an account? <span onClick={() => setPage('login')} className="text-gray-800 font-semibold cursor-pointer hover:underline">Log in</span></p>
          ) : (
            <p className="text-sm text-gray-600">Don't have an account? <span onClick={() => setPage('signup')} className="text-gray-800 font-semibold cursor-pointer hover:underline">Sign up</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

// Brands Component
const Brands = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Brands Page</h2>
    <p className="text-lg text-gray-600 text-center max-w-lg">Welcome to the Brands page! Here you can explore different brands and their sustainability profiles.</p>
    {user && <p className="mt-4 text-sm text-gray-500">Logged in as user: <span className="font-mono text-gray-700 break-all">{user.uid}</span></p>}
  </div>
);

// AdminPanel Component
const AdminPanel = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Admin Panel</h2>
    <p className="text-lg text-gray-600 text-center max-w-lg">This area is for administrators to manage brand data. Access is restricted.</p>
  </div>
);

// ProfilePage Component
const ProfilePage = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Profile Page</h2>
    <p className="text-lg text-gray-600 text-center max-w-lg">View and manage your user profile and settings here.</p>
    {user && (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">User Details:</h3>
        <p className="text-sm text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{user.uid}</span></p>
        <p className="text-sm text-gray-700"><strong>Email:</strong> {user.email || 'N/A'}</p>
        <p className="text-sm text-gray-700"><strong>Is Anonymous:</strong> {user.isAnonymous ? 'Yes' : 'No'}</p>
      </div>
    )}
  </div>
);

// Fallback UI for any unmatched routes
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
  </div>
);

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('loading');
  
  // Initialize Firebase and set up auth listener
  useEffect(() => {
    const { auth, db } = initializeFirebaseCanvasAuth();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCheckingAuth(false);
      setCurrentPage(user ? 'brands' : 'login');
    });

    return unsubscribeAuth;
  }, []);

  const renderPage = () => {
    if (checkingAuth) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-700 mb-2">Checking authentication...</p>
        </div>
      );
    }
    
    switch (currentPage) {
      case 'brands':
        return user ? <Brands user={user} /> : <AuthForm setPage={setCurrentPage} />;
      case 'admin':
        return user ? <AdminPanel /> : <AuthForm setPage={setCurrentPage} />;
      case 'profile':
        return user ? <ProfilePage user={user} /> : <AuthForm setPage={setCurrentPage} />;
      case 'login':
        return user ? <Brands user={user} /> : <AuthForm setPage={setCurrentPage} />;
      case 'signup':
        return user ? <Brands user={user} /> : <AuthForm setPage={setCurrentPage} signup />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div>
      <Navbar user={user} setPage={setCurrentPage} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
