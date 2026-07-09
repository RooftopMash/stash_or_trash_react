import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Social Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const requireFirebase = () => {
  if (!auth || !db) {
    throw new Error('Firebase is not configured. Add REACT_APP_FIREBASE_CONFIG before using authentication.');
  }
};

// Social Login
export const signInWithGoogle = async () => {
  try {
    requireFirebase();
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    requireFirebase();
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Email Auth
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    requireFirebase();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(result.user, {
      displayName: displayName,
    });
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: email,
      displayName: displayName,
      uid: result.user.uid,
      createdAt: new Date(),
      userType: 'user',
      verified: false,
      verifiedPlatforms: [],
      trustScore: 0,
      profileComplete: false,
    });
    
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    requireFirebase();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Sign Out
export const signOut = async () => {
  try {
    requireFirebase();
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get User Profile
export const getUserProfile = async (uid) => {
  try {
    requireFirebase();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (uid, data) => {
  try {
    requireFirebase();
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Add Verified Platform
export const addVerifiedPlatform = async (uid, platformId, platformData) => {
  try {
    requireFirebase();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const updatedPlatforms = [...(currentData.verifiedPlatforms || []), platformId];
      const avgTrustScore = Math.round(
        updatedPlatforms.reduce((sum, p) => {
          // Calculate average trust score
          return sum + 85; // Placeholder
        }, 0) / updatedPlatforms.length
      );
      
      await setDoc(docRef, {
        verifiedPlatforms: updatedPlatforms,
        trustScore: avgTrustScore,
        [`verified_${platformId}`]: platformData,
      }, { merge: true });
    }
  } catch (error) {
    throw error;
  }
};

export default {
  signInWithGoogle,
  signInWithFacebook,
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getUserProfile,
  updateUserProfile,
  addVerifiedPlatform,
};
