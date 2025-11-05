import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

/**
 * Create an activity log entry for a task or project
 */
export async function createActivityLogEntry(data: {
  entityType: 'task' | 'project' | 'subtask'
  entityId: string
  type: 'comment' | 'status_change' | 'assignment' | 'creation' | 'completion'
  userId: string
  userName: string
  content: string
  metadata?: {
    oldValue?: string
    newValue?: string
    field?: string
  }
}): Promise<void> {
  try {
    const activityData = {
      entityType: data.entityType,
      entityId: data.entityId,
      type: data.type,
      userId: data.userId,
      userName: data.userName,
      content: data.content,
      metadata: data.metadata,
      timestamp: serverTimestamp()
    }
    
    await addDoc(collection(db, 'activities'), activityData)
    console.log('✅ Activity log entry created:', activityData)
  } catch (error) {
    console.error('❌ Error creating activity log entry:', error)
    // Don't throw - activity log failures shouldn't break the main operation
  }
}

