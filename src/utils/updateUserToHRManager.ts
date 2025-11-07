import { db } from '@/integrations/firebase/client'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'

/**
 * Update a user to Manager role in HR team by email
 * This function ensures the user is set as Manager in the HR team
 */
export const updateUserToHRManager = async (email: string) => {
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
    
    // Update user profile to Manager in HR team
    const userRef = doc(db, 'profiles', userId)
    await updateDoc(userRef, {
      role: 'Manager',
      teamId: 'hr',
      updatedAt: new Date().toISOString(),
      // Add a flag to prevent accidental overwrites (similar to Senior Management)
      _hrManagerSet: true,
      _hrManagerSetAt: new Date().toISOString(),
    })
    
    console.log('✅ User updated to Manager in HR team successfully')
    return { 
      success: true, 
      message: `User ${email} updated to Manager in HR team successfully`,
      userId,
      teamId: 'hr'
    }
    
  } catch (error) {
    console.error('❌ Error updating user to Manager in HR team:', error)
    return { 
      success: false, 
      message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).updateUserToHRManager = updateUserToHRManager
}

