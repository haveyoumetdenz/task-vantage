import { db } from '@/integrations/firebase/client'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { createSeniorManagementTeam } from './createSeniorManagementTeam'

/**
 * Assign all Senior Management users to the senior-management team
 * This ensures they appear in the Team Management page
 */
export const assignSeniorManagementToTeam = async () => {
  try {
    console.log('🔧 Finding all Senior Management users...')
    
    // Ensure Senior Management team exists
    const teamResult = await createSeniorManagementTeam()
    if (!teamResult.success) {
      console.warn('⚠️ Could not create Senior Management team, continuing anyway...')
    }
    
    // Find all users with Senior Management role
    const profilesRef = collection(db, 'profiles')
    const roleQuery = query(profilesRef, where('role', '==', 'Senior Management'))
    const roleSnapshot = await getDocs(roleQuery)
    
    if (roleSnapshot.empty) {
      console.log('ℹ️ No Senior Management users found')
      return { 
        success: true, 
        message: 'No Senior Management users found',
        updatedCount: 0
      }
    }
    
    console.log(`🔍 Found ${roleSnapshot.size} Senior Management user(s)`)
    
    let updatedCount = 0
    const updates = []
    
    for (const userDoc of roleSnapshot.docs) {
      const userId = userDoc.id
      const userData = userDoc.data()
      
      // Only update if teamId is not already 'senior-management'
      if (userData.teamId !== 'senior-management') {
        const userRef = doc(db, 'profiles', userId)
        updates.push(
          updateDoc(userRef, {
            teamId: 'senior-management',
            updatedAt: new Date().toISOString(),
          })
        )
        updatedCount++
        console.log(`📝 Updating user ${userData.email || userId} to senior-management team`)
      } else {
        console.log(`✓ User ${userData.email || userId} already has correct teamId`)
      }
    }
    
    if (updates.length > 0) {
      await Promise.all(updates)
      console.log(`✅ Updated ${updatedCount} Senior Management user(s) to senior-management team`)
    } else {
      console.log('ℹ️ All Senior Management users already have correct teamId')
    }
    
    return { 
      success: true, 
      message: `Updated ${updatedCount} Senior Management user(s) to senior-management team`,
      updatedCount 
    }
    
  } catch (error) {
    console.error('❌ Error assigning Senior Management to team:', error)
    return { 
      success: false, 
      message: `Failed to assign users: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).assignSeniorManagementToTeam = assignSeniorManagementToTeam
}

