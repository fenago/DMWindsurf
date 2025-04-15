import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

// Cache for local development file URLs
const localFileCache = new Map();

/**
 * Handles file uploads with a development mode fallback that avoids CORS issues
 * In development: Creates object URLs and simulates uploads
 * In production: Uses actual Firebase Storage
 */
export const uploadFile = async (file, path, fileName) => {
  if (!file) return null;
  
  // For development environment, use local object URLs to avoid CORS issues
  if (isDevelopment) {
    console.log('Development mode: Using local object URL instead of Firebase Storage');
    
    // Generate a unique ID for this file
    const fileId = `${path}/${fileName || file.name}-${Date.now()}`;
    
    // Create a local object URL
    const objectUrl = URL.createObjectURL(file);
    
    // Store in local cache
    localFileCache.set(fileId, objectUrl);
    
    // Return a fake firebase-like URL structure
    return {
      url: objectUrl,
      fullPath: fileId,
      isDevelopmentUrl: true
    };
  }
  
  // For production, use actual Firebase Storage
  try {
    const fullPath = fileName ? `${path}/${fileName}` : `${path}/${file.name}`;
    const storageRef = ref(storage, fullPath);
    
    // Upload file to Firebase Storage
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      url: downloadURL,
      fullPath: fullPath,
      isDevelopmentUrl: false
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Gets a file URL, handling both development and production environments
 */
export const getFileUrl = async (path) => {
  if (isDevelopment) {
    // Check if we have a cached local URL
    if (localFileCache.has(path)) {
      return localFileCache.get(path);
    }
    return null;
  }
  
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL from Firebase Storage:', error);
    return null;
  }
};

/**
 * Revokes development object URLs when they're no longer needed
 * Important to prevent memory leaks
 */
export const revokeObjectUrl = (url) => {
  if (isDevelopment && url && typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    
    // Remove from cache
    for (const [key, value] of localFileCache.entries()) {
      if (value === url) {
        localFileCache.delete(key);
        break;
      }
    }
  }
};
