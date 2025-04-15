import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ROLES } from '../contexts/AuthContext';

/**
 * Utility function to promote a user to admin status
 * In a real production app, this would be done securely through backend functions
 * This is for demonstration purposes only
 */
export const promoteToAdmin = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const userRef = doc(db, 'users', userId);
  
  try {
    await updateDoc(userRef, {
      role: ROLES.ADMIN,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};
