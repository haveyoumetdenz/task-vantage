/**
 * Script to update a user to Senior Management role
 * 
 * Usage:
 * 1. Make sure Firebase emulator is running (for local) or connected to production
 * 2. Run: node scripts/update-user-to-senior-management.js
 * 
 * Or use in browser console:
 * import { updateUserToSeniorManagement } from '@/utils/updateUserToSeniorManagement'
 * await updateUserToSeniorManagement('denzel.toh.2022@scis.smu.edu.sg')
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore')

// Firebase config - adjust for your environment
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'task-vantage-test',
  // Add other config as needed
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function updateUserToSeniorManagement(email) {
  try {
    console.log('🔧 Finding user by email:', email)
    
    // Find user by email
    const profilesRef = collection(db, 'profiles')
    const emailQuery = query(profilesRef, where('email', '==', email.toLowerCase()))
    const emailSnapshot = await getDocs(emailQuery)
    
    if (emailSnapshot.empty) {
      console.error('❌ User not found with email:', email)
      return { 
        success: false, 
        message: `User not found with email: ${email}` 
      }
    }
    
    const userDoc = emailSnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()
    
    console.log('🔍 Found user:', {
      userId,
      email: userData.email,
      currentRole: userData.role,
      currentTeamId: userData.teamId
    })
    
    // Update user profile
    const userRef = doc(db, 'profiles', userId)
    await updateDoc(userRef, {
      role: 'Senior Management',
      teamId: null, // Senior Management is not in any team
      updatedAt: new Date().toISOString(),
    })
    
    console.log('✅ User updated to Senior Management successfully')
    return { 
      success: true, 
      message: `User ${email} updated to Senior Management successfully`,
      userId 
    }
    
  } catch (error) {
    console.error('❌ Error updating user to Senior Management:', error)
    return { 
      success: false, 
      message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Run if called directly
if (require.main === module) {
  const email = process.argv[2] || 'denzel.toh.2022@scis.smu.edu.sg'
  updateUserToSeniorManagement(email)
    .then(result => {
      console.log('Result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('Error:', error)
      process.exit(1)
    })
}

module.exports = { updateUserToSeniorManagement }

