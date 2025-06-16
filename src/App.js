import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Brands from "./pages/Brands";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { auth } from "./firebase";

// Fallback UI
const NotFound = () => (
  <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Page Not Found</h2>
);

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUser(user);
      setCheckingAuth(false);
    });
    return unsub;
  }, []);

  if (checkingAuth) return <p style={{ textAlign: "center" }}>Checking authentication...</p>;

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/brands" /> : <Navigate to="/login" />
          }
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
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
