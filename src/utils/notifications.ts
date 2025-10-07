import { db } from '@/integrations/firebase/client'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export interface NotificationData {
  userId: string
  type: 'mention' | 'task_assigned' | 'task_completed' | 'task_overdue' | 'task_due_soon' | 'project_assigned' | 'project_completed'
  title: string
  message: string
  entityType?: 'task' | 'project'
  entityId?: string
  activityId?: string
  read: boolean
  timestamp: any
}

// Create a notification for a specific user
export const createNotification = async (notificationData: Omit<NotificationData, 'read' | 'timestamp'>) => {
  try {
    console.log('🔔 Creating notification:', notificationData)
    console.log('🔔 Notification data details:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      entityType: notificationData.entityType,
      entityId: notificationData.entityId
    })
    
    const notification = {
      ...notificationData,
      read: false,
      timestamp: serverTimestamp()
    }
    
    console.log('🔔 Final notification object:', notification)
    const docRef = await addDoc(collection(db, 'notifications'), notification)
    console.log('✅ Notification created with ID:', docRef.id, 'for user:', notificationData.userId)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    console.error('❌ Error details:', error)
    throw error
  }
}

// Create notifications for multiple users
export const createNotificationsForUsers = async (userIds: string[], notificationData: Omit<NotificationData, 'userId' | 'read' | 'timestamp'>) => {
  try {
    console.log('🔔 Creating notifications for users:', userIds)
    
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId,
      read: false,
      timestamp: serverTimestamp()
    }))
    
    // Create all notifications in parallel
    const promises = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), notification)
    )
    
    const docRefs = await Promise.all(promises)
    console.log('✅ Created', docRefs.length, 'notifications')
    return docRefs.map(ref => ref.id)
  } catch (error) {
    console.error('❌ Error creating notifications for users:', error)
    throw error
  }
}

// Task assignment notification
export const createTaskAssignmentNotification = async (assigneeId: string, taskTitle: string, taskId: string, assignerName: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `${assignerName} assigned you a new task: "${taskTitle}"`,
    entityType: 'task',
    entityId: taskId
  })
}

// Task completion notification
export const createTaskCompletionNotification = async (assigneeId: string, taskTitle: string, taskId: string, completerName: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'task_completed',
    title: 'Task Completed',
    message: `${completerName} completed the task: "${taskTitle}"`,
    entityType: 'task',
    entityId: taskId
  })
}

// Task overdue notification
export const createTaskOverdueNotification = async (assigneeId: string, taskTitle: string, taskId: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'task_overdue',
    title: 'Task Overdue',
    message: `The task "${taskTitle}" is overdue and needs attention`,
    entityType: 'task',
    entityId: taskId
  })
}

// Task due soon notification
export const createTaskDueSoonNotification = async (assigneeId: string, taskTitle: string, taskId: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'task_due_soon',
    title: 'Task Due Soon',
    message: `The task "${taskTitle}" is due soon`,
    entityType: 'task',
    entityId: taskId
  })
}

// Project assignment notification
export const createProjectAssignmentNotification = async (assigneeId: string, projectTitle: string, projectId: string, assignerName: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'project_assigned',
    title: 'New Project Assigned',
    message: `${assignerName} assigned you to a new project: "${projectTitle}"`,
    entityType: 'project',
    entityId: projectId
  })
}

// Project completion notification
export const createProjectCompletionNotification = async (assigneeId: string, projectTitle: string, projectId: string, completerName: string) => {
  return createNotification({
    userId: assigneeId,
    type: 'project_completed',
    title: 'Project Completed',
    message: `${completerName} completed the project: "${projectTitle}"`,
    entityType: 'project',
    entityId: projectId
  })
}
