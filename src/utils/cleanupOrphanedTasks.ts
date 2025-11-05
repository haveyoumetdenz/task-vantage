/**
 * Utility to clean up orphaned tasks (tasks assigned to deleted users)
 * This should be run periodically or when a user is deleted
 */

import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch, getDoc } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

/**
 * Clean up orphaned assigneeIds from tasks
 * Removes assigneeIds that don't correspond to existing user profiles
 */
export const cleanupOrphanedAssigneeIds = async (): Promise<{
  tasksUpdated: number
  tasksDeleted: number
  errors: string[]
}> => {
  const errors: string[] = []
  let tasksUpdated = 0
  let tasksDeleted = 0

  try {
    // Get all profiles to build a valid userId set
    const profilesSnapshot = await getDocs(collection(db, 'profiles'))
    const validUserIds = new Set<string>()
    profilesSnapshot.docs.forEach(doc => {
      validUserIds.add(doc.id)
    })

    console.log(`✅ Found ${validUserIds.size} valid user profiles`)

    // Get all tasks
    const tasksSnapshot = await getDocs(collection(db, 'tasks'))
    console.log(`📋 Found ${tasksSnapshot.size} tasks to check`)

    // Process tasks in batches
    const batch = writeBatch(db)
    let batchCount = 0
    const BATCH_LIMIT = 500 // Firestore batch limit

    for (const taskDoc of tasksSnapshot.docs) {
      const taskData = taskDoc.data()
      const assigneeIds = taskData.assigneeIds || []
      
      if (assigneeIds.length === 0) {
        continue // Skip tasks without assignees
      }

      // Filter out invalid assigneeIds
      const validAssigneeIds = assigneeIds.filter((id: string) => validUserIds.has(id))
      const orphanedIds = assigneeIds.filter((id: string) => !validUserIds.has(id))

      if (orphanedIds.length > 0) {
        console.log(`🔧 Task ${taskDoc.id} has ${orphanedIds.length} orphaned assignee(s):`, orphanedIds)
        
        // If task has no valid assignees left, delete it
        if (validAssigneeIds.length === 0) {
          batch.delete(taskDoc.ref)
          tasksDeleted++
          console.log(`🗑️ Deleting task ${taskDoc.id} (no valid assignees)`)
        } else {
          // Update task with only valid assigneeIds
          batch.update(taskDoc.ref, {
            assigneeIds: validAssigneeIds,
            updatedAt: new Date().toISOString()
          })
          tasksUpdated++
        }

        batchCount++

        // Commit batch if we're approaching the limit
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit()
          console.log(`✅ Committed batch of ${batchCount} updates`)
          batchCount = 0
        }
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit()
      console.log(`✅ Committed final batch of ${batchCount} updates`)
    }

    console.log(`✅ Cleanup complete: ${tasksUpdated} tasks updated, ${tasksDeleted} tasks deleted`)
    return {
      tasksUpdated,
      tasksDeleted,
      errors
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error cleaning up orphaned tasks:', errorMessage)
    errors.push(errorMessage)
    return {
      tasksUpdated,
      tasksDeleted,
      errors
    }
  }
}

/**
 * Validate that a task's assigneeIds are all valid
 */
export const validateTaskAssigneeIds = async (taskId: string): Promise<{
  valid: boolean
  orphanedIds: string[]
}> => {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId))
    if (!taskDoc.exists()) {
      return { valid: false, orphanedIds: [] }
    }

    const taskData = taskDoc.data()
    const assigneeIds = taskData.assigneeIds || []

    if (assigneeIds.length === 0) {
      return { valid: true, orphanedIds: [] }
    }

    // Get all profiles to build a valid userId set
    const profilesSnapshot = await getDocs(collection(db, 'profiles'))
    const validUserIds = new Set<string>()
    profilesSnapshot.docs.forEach(doc => {
      validUserIds.add(doc.id)
    })

    const orphanedIds = assigneeIds.filter((id: string) => !validUserIds.has(id))

    return {
      valid: orphanedIds.length === 0,
      orphanedIds
    }
  } catch (error) {
    console.error('❌ Error validating task assigneeIds:', error)
    return { valid: false, orphanedIds: [] }
  }
}

/**
 * Filter out orphaned assigneeIds from a task before displaying
 * This is a client-side safety check
 */
export const filterValidAssigneeIds = async (assigneeIds: string[]): Promise<string[]> => {
  if (!assigneeIds || assigneeIds.length === 0) {
    return []
  }

  try {
    // Get all profiles to build a valid userId set
    const profilesSnapshot = await getDocs(collection(db, 'profiles'))
    const validUserIds = new Set<string>()
    profilesSnapshot.docs.forEach(doc => {
      validUserIds.add(doc.id)
    })

    return assigneeIds.filter(id => validUserIds.has(id))
  } catch (error) {
    console.error('❌ Error filtering assigneeIds:', error)
    // Return empty array on error to be safe
    return []
  }
}

