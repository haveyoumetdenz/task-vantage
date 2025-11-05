import { describe, it, expect, beforeAll } from 'vitest'
import { db, clearCollection } from '@/test/emulatorDb'
import { createActivityEmu, getActivityByIdEmu, getActivitiesByEntityEmu, updateActivityEmu, deleteActivityEmu } from '@/services/activities.emu'
import { createTaskEmu } from '@/services/tasks.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearAll() {
  await clearCollection('activities')
  await clearCollection('tasks')
}

describe('TM-COR-07: Comment in Activity Log (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    await clearAll()
  })

  it('should create a comment activity for a task', async () => {
    // Create a task first
    const taskId = await createTaskEmu({ 
      title: 'Test Task for Comment', 
      status: 'todo', 
      priority: 5 
    })

    // Wait for task to be committed
    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a comment activity
    const activityId = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-123',
      userName: 'Test User',
      content: 'This is a test comment'
    })

    // Verify activity was created
    const activity = await getActivityByIdEmu(activityId)
    expect(activity.exists).toBe(true)
    expect(activity.data?.type).toBe('comment')
    expect(activity.data?.content).toBe('This is a test comment')
    expect(activity.data?.entityType).toBe('task')
    expect(activity.data?.entityId).toBe(taskId)
    expect(activity.data?.userId).toBe('user-123')
    expect(activity.data?.userName).toBe('Test User')
  })

  it('should query activities by entity', async () => {
    // Create a task
    const taskId = await createTaskEmu({ 
      title: 'Task with Multiple Comments', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create multiple comments
    const comment1 = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-1',
      userName: 'User One',
      content: 'First comment'
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    const comment2 = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-2',
      userName: 'User Two',
      content: 'Second comment'
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Query activities for this task
    const activities = await getActivitiesByEntityEmu('task', taskId)

    // Should have 2 comments
    expect(activities.length).toBeGreaterThanOrEqual(2)
    
    // Find our comments
    const foundComment1 = activities.find(a => a.id === comment1)
    const foundComment2 = activities.find(a => a.id === comment2)
    
    expect(foundComment1).toBeDefined()
    expect(foundComment2).toBeDefined()
    expect(foundComment1?.content).toBe('First comment')
    expect(foundComment2?.content).toBe('Second comment')
  })

  it('should update a comment', async () => {
    // Create a task
    const taskId = await createTaskEmu({ 
      title: 'Task for Update Test', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a comment
    const activityId = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-123',
      userName: 'Test User',
      content: 'Original comment'
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Update the comment
    await updateActivityEmu(activityId, {
      content: 'Updated comment'
    })

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify update
    const activity = await getActivityByIdEmu(activityId)
    expect(activity.exists).toBe(true)
    expect(activity.data?.content).toBe('Updated comment')
  })

  it('should delete a comment', async () => {
    // Create a task
    const taskId = await createTaskEmu({ 
      title: 'Task for Delete Test', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a comment
    const activityId = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-123',
      userName: 'Test User',
      content: 'Comment to delete'
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify it exists
    let activity = await getActivityByIdEmu(activityId)
    expect(activity.exists).toBe(true)

    // Delete the comment
    await deleteActivityEmu(activityId)

    // Wait for deletion
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify it's deleted
    activity = await getActivityByIdEmu(activityId)
    expect(activity.exists).toBe(false)
  })

  it('should reject invalid comment content', async () => {
    // Create a task
    const taskId = await createTaskEmu({ 
      title: 'Task for Validation Test', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Try to create comment with empty content (should fail validation)
    await expect(
      createActivityEmu({
        entityType: 'task',
        entityId: taskId,
        type: 'comment',
        userId: 'user-123',
        userName: 'Test User',
        content: '' // Empty content should fail
      })
    ).rejects.toThrow()
  })

  it('should create comment with mentions', async () => {
    // Create a task
    const taskId = await createTaskEmu({ 
      title: 'Task with Mentions', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create comment with mentions
    const activityId = await createActivityEmu({
      entityType: 'task',
      entityId: taskId,
      type: 'comment',
      userId: 'user-123',
      userName: 'Test User',
      content: 'Comment with @user1 and @user2',
      mentions: ['user-1', 'user-2']
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify mentions were saved
    const activity = await getActivityByIdEmu(activityId)
    expect(activity.exists).toBe(true)
    expect(activity.data?.mentions).toEqual(['user-1', 'user-2'])
    expect(activity.data?.mentions?.length).toBe(2)
  })
})

