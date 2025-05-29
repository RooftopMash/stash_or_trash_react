import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Brands from "./pages/Brands";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { auth } from "./firebase";

// This keeps your user session in sync
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/brands" /> : <Home />
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
        {/* 404 fallback */}
        <Route path="*" element={<h2 style={{textAlign:'center'}}>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
