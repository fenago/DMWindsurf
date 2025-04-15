import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { uploadFile, getFileUrl } from '../utils/storageUtils';

// User role constants
export const ROLES = {
  FREE: 'free',
  SUBSCRIBER: 'subscriber',
  ADMIN: 'admin'
};

// Default user profile
const DEFAULT_USER_PROFILE = {
  bio: '',
  location: '',
  occupation: '',
  website: '',
  interests: []
};

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Add name to user profile
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      // Set default role and profile for new users
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name: name || '',
        role: ROLES.FREE,
        avatarUrl: '',
        profile: DEFAULT_USER_PROFILE,
        createdAt: new Date().toISOString()
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserRole(uid, newRole) {
    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error('Invalid role');
    }
    
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      
      setUserRole(newRole);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Check if user is admin
  function isAdmin() {
    return userRole === ROLES.ADMIN;
  }

  // Check if user is a paid subscriber
  function isSubscriber() {
    return userRole === ROLES.SUBSCRIBER || userRole === ROLES.ADMIN;
  }

  // Function to upload avatar image
  async function uploadAvatar(file, userId) {
    if (!file) return null;
    setProfileLoading(true);
    
    try {
      // Use our storage utility to handle the upload
      const result = await uploadFile(file, 'avatars', userId);
      const downloadURL = result.url;
      
      // Update user document with avatar URL
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        avatarUrl: downloadURL,
        avatarPath: result.fullPath,
        avatarIsDev: result.isDevelopmentUrl || false
      });
      
      // Update local state
      setUserProfile(prev => ({...prev, avatarUrl: downloadURL}));
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }

  // Function to update user profile fields
  async function updateUserProfile(userId, profileData) {
    if (!userId || !profileData) return null;
    setProfileLoading(true);
    
    try {
      const userRef = doc(db, 'users', userId);
      
      // Update only profile fields that are provided
      await updateDoc(userRef, { profile: profileData });
      
      // Update local state
      setUserProfile(prev => ({...prev, ...profileData}));
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }

  // Fetch user profile data
  async function fetchUserProfile(userId) {
    if (!userId) return null;
    setProfileLoading(true);
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          avatarUrl: userData.avatarUrl || '',
          profile: userData.profile || DEFAULT_USER_PROFILE
        });
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            
            // Set profile data
            setUserProfile({
              avatarUrl: userData.avatarUrl || '',
              profile: userData.profile || DEFAULT_USER_PROFILE
            });
          } else {
            // If user exists in auth but not in Firestore, create a record
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              name: user.displayName || '',
              role: ROLES.FREE,
              avatarUrl: '',
              profile: DEFAULT_USER_PROFILE,
              createdAt: new Date().toISOString()
            });
            setUserRole(ROLES.FREE);
            setUserProfile({ avatarUrl: '', profile: DEFAULT_USER_PROFILE });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(ROLES.FREE); // Default to FREE if there's an error
          setUserProfile({ avatarUrl: '', profile: DEFAULT_USER_PROFILE });
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    profileLoading,
    signup,
    login,
    logout,
    updateUserRole,
    uploadAvatar,
    updateUserProfile,
    fetchUserProfile,
    isAdmin,
    isSubscriber,
    ROLES,
    DEFAULT_USER_PROFILE
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
