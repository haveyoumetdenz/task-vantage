import { db } from '@/integrations/firebase/client'
import { doc, updateDoc } from 'firebase/firestore'

export interface UpdateUserRoleOptions {
  userId: string
  newRole: 'Staff' | 'Manager' | 'HR' | 'Director' | 'Senior Management'
  updatedBy: string
}

export const updateUserRole = async (options: UpdateUserRoleOptions) => {
  try {
    const { userId, newRole, updatedBy } = options
    
    console.log('🔧 Updating user role:', { userId, newRole, updatedBy })
    
    const userRef = doc(db, 'profiles', userId)
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: updatedBy
    })
    
    console.log('✅ User role updated successfully')
    return { success: true, message: 'User role updated successfully' }
    
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    return { 
      success: false, 
      message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).updateUserRole = updateUserRole
}
