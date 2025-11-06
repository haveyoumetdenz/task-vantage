import { db } from '@/integrations/firebase/client'
import { doc, setDoc, getDoc } from 'firebase/firestore'

/**
 * Create a Senior Management team in Firestore
 * This team is for organizational purposes and can be assigned to Senior Management users
 */
export const createSeniorManagementTeam = async (managerId?: string) => {
  try {
    console.log('🔧 Creating Senior Management team...')
    
    const teamId = 'senior-management'
    const teamRef = doc(db, 'teams', teamId)
    
    // Check if team already exists
    const teamDoc = await getDoc(teamRef)
    if (teamDoc.exists()) {
      console.log('ℹ️ Senior Management team already exists')
      return { 
        success: true, 
        message: 'Senior Management team already exists',
        teamId 
      }
    }
    
    // Create the team
    const teamData = {
      id: teamId,
      name: 'Senior Management',
      description: 'Senior Management team - oversees all teams',
      parentTeamId: null, // Top-level team
      managerId: managerId || '', // Optional manager ID
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    await setDoc(teamRef, teamData, { merge: true })
    
    console.log('✅ Senior Management team created successfully')
    return { 
      success: true, 
      message: 'Senior Management team created successfully',
      teamId 
    }
    
  } catch (error) {
    console.error('❌ Error creating Senior Management team:', error)
    return { 
      success: false, 
      message: `Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).createSeniorManagementTeam = createSeniorManagementTeam
}

