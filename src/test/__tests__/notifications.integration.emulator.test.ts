import { describe, it, expect, beforeAll } from 'vitest'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createNotificationEmu, getNotificationByIdEmu } from '@/services/notifications.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearNotifications() {
  await clearCollection('notifications')
}

describe('NS-COR-01: Task/Project Update Notifications (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    await clearNotifications()
  })

  it('should create task assignment notification', async () => {
    const notificationId = await createNotificationEmu({
      userId: 'user-123',
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'You have been assigned to the task "Test Task"',
      entityType: 'task',
      entityId: 'task-123'
    })
    
    const notification = await getNotificationByIdEmu(notificationId)
    expect(notification.exists).toBe(true)
    expect(notification.data?.type).toBe('task_assigned')
    expect(notification.data?.title).toBe('Task Assigned')
    expect(notification.data?.read).toBe(false)
    expect(notification.data?.userId).toBe('user-123')
  })

  it('should create overdue task notification', async () => {
    const notificationId = await createNotificationEmu({
      userId: 'user-123',
      type: 'task_overdue',
      title: 'Task Overdue',
      message: 'The task "Overdue Task" is overdue and needs attention',
      entityType: 'task',
      entityId: 'task-456'
    })
    
    const notification = await getNotificationByIdEmu(notificationId)
    expect(notification.exists).toBe(true)
    expect(notification.data?.type).toBe('task_overdue')
    expect(notification.data?.read).toBe(false)
  })

  it('should create mention notification', async () => {
    const notificationId = await createNotificationEmu({
      userId: 'user-123',
      type: 'mention',
      title: 'You were mentioned',
      message: 'You were mentioned in a comment on task "Test Task": "Please review this"',
      entityType: 'task',
      entityId: 'task-789'
    })
    
    const notification = await getNotificationByIdEmu(notificationId)
    expect(notification.exists).toBe(true)
    expect(notification.data?.type).toBe('mention')
    expect(notification.data?.message).toContain('mentioned')
  })

  it('should reject invalid notification type', async () => {
    await expect(
      createNotificationEmu({
        userId: 'user-123',
        type: 'invalid_type',
        title: 'Invalid',
        message: 'Invalid notification'
      })
    ).rejects.toThrow('Invalid notification type')
  })

  it('should reject empty title', async () => {
    await expect(
      createNotificationEmu({
        userId: 'user-123',
        type: 'task_assigned',
        title: '',
        message: 'Message'
      })
    ).rejects.toThrow('Notification title is required')
  })

  it('should query notifications by userId', async () => {
    // Clear notifications first to ensure clean state
    await clearNotifications()
    
    await createNotificationEmu({
      userId: 'user-123',
      type: 'task_assigned',
      title: 'Notification 1',
      message: 'Message 1'
    })
    
    await createNotificationEmu({
      userId: 'user-123',
      type: 'task_assigned',
      title: 'Notification 2',
      message: 'Message 2'
    })
    
    await createNotificationEmu({
      userId: 'user-456',
      type: 'task_assigned',
      title: 'Notification 3',
      message: 'Message 3'
    })
    
    const q = query(collection(db, 'notifications'), where('userId', '==', 'user-123'))
    const snap = await getDocs(q)
    
    expect(snap.docs.length).toBe(2)
    expect(snap.docs.every(d => d.data().userId === 'user-123')).toBe(true)
  })
})

