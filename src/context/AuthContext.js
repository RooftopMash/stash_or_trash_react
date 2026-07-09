import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/authService';

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
    if (!auth) {
      setLoading(false);
      setError('Firebase is not configured. Add REACT_APP_FIREBASE_CONFIG to enable authentication.');
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getUserProfile(currentUser.uid);

          if (userProfile) {
            setProfile(userProfile);
            setUserType(userProfile.userType || 'user');
            setVerificationStatus(userProfile.verified || false);
            setTrustScore(userProfile.trustScore || 0);
          } else {
            setProfile(null);
            setUserType('user');
            setVerificationStatus(false);
            setTrustScore(0);
          }
        } else {
          setUser(null);
          setProfile(null);
          setUserType(null);
          setVerificationStatus(null);
          setTrustScore(0);
        }
      } catch (err) {
        setError(err.message);
        setUser(null);
        setProfile(null);
        setUserType(null);
        setVerificationStatus(null);
        setTrustScore(0);
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
