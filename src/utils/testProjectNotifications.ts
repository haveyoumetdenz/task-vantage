import { createProjectAssignmentNotification } from './notifications'

// Test function to manually create a project assignment notification
export const testProjectAssignmentNotification = async (userId: string) => {
  try {
    console.log('🧪 Testing project assignment notification for user:', userId)
    
    const result = await createProjectAssignmentNotification(
      userId,
      'Test Project',
      'test-project-id',
      'Test User'
    )
    
    console.log('✅ Test project assignment notification created:', result)
    return result
  } catch (error) {
    console.error('❌ Error creating test project assignment notification:', error)
    throw error
  }
}
