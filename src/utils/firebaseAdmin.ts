// Firebase Admin SDK setup for server-side operations
// This requires Firebase Admin SDK to be installed and configured

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
const initializeAdminApp = () => {
  if (getApps().length === 0) {
    // You'll need to set up a service account key
    // Download it from Firebase Console → Project Settings → Service Accounts
    const serviceAccount = {
      // Replace with your actual service account credentials
      // Or use environment variables for security
      projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'your-service-account@your-project.iam.gserviceaccount.com',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'your-private-key'
    }

    try {
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId
      })
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error)
      return null
    }
  }
  return getApps()[0]
}

// Delete user from Firebase Auth using Admin SDK
export const deleteUserFromAuth = async (userId: string) => {
  try {
    const app = initializeAdminApp()
    if (!app) {
      throw new Error('Failed to initialize Firebase Admin SDK')
    }

    const auth = getAuth(app)
    
    console.log('🔐 Deleting Firebase Auth account for user:', userId)
    
    await auth.deleteUser(userId)
    
    console.log('✅ Firebase Auth account deleted successfully')
    return {
      success: true,
      message: 'Firebase Auth account deleted successfully'
    }
    
  } catch (error) {
    console.error('❌ Error deleting Firebase Auth account:', error)
    return {
      success: false,
      message: `Failed to delete Firebase Auth account: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Delete user from Firestore using Admin SDK
export const deleteUserFromFirestore = async (userId: string) => {
  try {
    const app = initializeAdminApp()
    if (!app) {
      throw new Error('Failed to initialize Firebase Admin SDK')
    }

    const db = getFirestore(app)
    
    console.log('🗑️ Deleting Firestore profile for user:', userId)
    
    await db.collection('profiles').doc(userId).delete()
    
    console.log('✅ Firestore profile deleted successfully')
    return {
      success: true,
      message: 'Firestore profile deleted successfully'
    }
    
  } catch (error) {
    console.error('❌ Error deleting Firestore profile:', error)
    return {
      success: false,
      message: `Failed to delete Firestore profile: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Complete user deletion (both Auth and Firestore)
export const completelyDeleteUser = async (userId: string) => {
  try {
    console.log('🗑️ Starting complete user deletion for:', userId)
    
    // Delete from Firestore first
    const firestoreResult = await deleteUserFromFirestore(userId)
    if (!firestoreResult.success) {
      return firestoreResult
    }
    
    // Then delete from Auth
    const authResult = await deleteUserFromAuth(userId)
    if (!authResult.success) {
      return authResult
    }
    
    console.log('✅ User completely deleted from both Auth and Firestore')
    return {
      success: true,
      message: 'User completely deleted from both Firebase Auth and Firestore'
    }
    
  } catch (error) {
    console.error('❌ Error in complete user deletion:', error)
    return {
      success: false,
      message: `Failed to completely delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).deleteUserFromAuth = deleteUserFromAuth
  (window as any).deleteUserFromFirestore = deleteUserFromFirestore
  (window as any).completelyDeleteUser = completelyDeleteUser
}

