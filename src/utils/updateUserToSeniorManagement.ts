import { db } from '@/integrations/firebase/client'
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { createSeniorManagementTeam } from './createSeniorManagementTeam'

/**
 * Update a user to Senior Management role by email
 * Also sets teamId to 'senior-management' if the team exists, otherwise null
 */
export const updateUserToSeniorManagement = async (email: string) => {
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
    
    // Ensure Senior Management team exists
    const teamResult = await createSeniorManagementTeam(userId)
    if (!teamResult.success) {
      console.warn('⚠️ Could not create Senior Management team, continuing anyway...')
    }
    
    // Check if Senior Management team exists
    const teamRef = doc(db, 'teams', 'senior-management')
    const teamDoc = await getDoc(teamRef)
    const teamId = teamDoc.exists() ? 'senior-management' : null
    
    // Update user profile
    const userRef = doc(db, 'profiles', userId)
    await updateDoc(userRef, {
      role: 'Senior Management',
      teamId: teamId || 'senior-management', // Always set to 'senior-management' if team exists
      updatedAt: new Date().toISOString(),
      // Add a flag to prevent accidental overwrites
      _seniorManagementSet: true,
      _seniorManagementSetAt: new Date().toISOString(),
    })
    
    console.log('✅ User updated to Senior Management successfully')
    console.log('✅ Team will display as "Senior Management" in the user table')
    return { 
      success: true, 
      message: `User ${email} updated to Senior Management successfully`,
      userId,
      teamId 
    }
    
  } catch (error) {
    console.error('❌ Error updating user to Senior Management:', error)
    return { 
      success: false, 
      message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).updateUserToSeniorManagement = updateUserToSeniorManagement
}


