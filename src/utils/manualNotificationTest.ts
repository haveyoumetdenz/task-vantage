import { createProjectAssignmentNotification } from './notifications'

// Manual test function that can be called from browser console
export const testProjectNotification = async (userId: string) => {
  try {
    console.log('🧪 Testing project assignment notification for user:', userId)
    
    const result = await createProjectAssignmentNotification(
      userId,
      'Test Project Assignment',
      'test-project-123',
      'Test Assigner'
    )
    
    console.log('✅ Test project assignment notification created:', result)
    return result
  } catch (error) {
    console.error('❌ Error creating test project assignment notification:', error)
    throw error
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testProjectNotification = testProjectNotification
}
