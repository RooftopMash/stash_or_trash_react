import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' | 'brand' | 'admin'
  const [verificationStatus, setVerificationStatus] = useState(null); // Social verification status
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          // Fetch user profile and verification status
          // This will be implemented with Firebase Firestore
        } else {
          setUser(null);
          setProfile(null);
          setUserType(null);
          setVerificationStatus(null);
          setTrustScore(0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    userType,
    verificationStatus,
    trustScore,
    setProfile,
    setUserType,
    setVerificationStatus,
    setTrustScore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
