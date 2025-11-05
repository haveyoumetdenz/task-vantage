/**
 * Notification validation utilities
 * Tests: NS-COR-01, NS-COR-02, NS-COR-04
 */

export type NotificationType = 
  | 'mention' 
  | 'task_assigned' 
  | 'task_completed' 
  | 'task_overdue' 
  | 'task_due_soon' 
  | 'project_assigned' 
  | 'project_completed' 
  | 'comment'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates notification type
 */
export function isValidNotificationType(type: string): type is NotificationType {
  const validTypes: NotificationType[] = [
    'mention',
    'task_assigned',
    'task_completed',
    'task_overdue',
    'task_due_soon',
    'project_assigned',
    'project_completed',
    'comment'
  ]
  
  return validTypes.includes(type as NotificationType)
}

/**
 * Validates notification title
 */
export function validateNotificationTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Notification title is required' }
  }
  
  if (title.length > 200) {
    return { valid: false, error: 'Notification title cannot exceed 200 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates notification message
 */
export function validateNotificationMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Notification message is required' }
  }
  
  if (message.length > 1000) {
    return { valid: false, error: 'Notification message cannot exceed 1000 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates complete notification data
 */
export function validateNotificationData(data: {
  userId: string
  type: string
  title: string
  message: string
  entityType?: string
  entityId?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.userId || data.userId.trim().length === 0) {
    errors.push('User ID is required')
  }
  
  if (!isValidNotificationType(data.type)) {
    errors.push(`Invalid notification type: ${data.type}`)
  }
  
  const titleValidation = validateNotificationTitle(data.title)
  if (!titleValidation.valid) {
    errors.push(titleValidation.error!)
  }
  
  const messageValidation = validateNotificationMessage(data.message)
  if (!messageValidation.valid) {
    errors.push(messageValidation.error!)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Checks if a task is overdue based on due date
 */
export function isTaskOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled') {
    return false
  }
  
  const due = new Date(dueDate)
  const now = new Date()
  
  return due < now
}

/**
 * Checks if a task is due soon (within 24 hours)
 */
export function isTaskDueSoon(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled') {
    return false
  }
  
  const due = new Date(dueDate)
  const now = new Date()
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilDue > 0 && hoursUntilDue <= 24
}

/**
 * Creates notification data for task assignment
 */
export function createTaskAssignmentNotification(userId: string, taskTitle: string, taskId: string): {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType: 'task'
  entityId: string
} {
  return {
    userId,
    type: 'task_assigned',
    title: 'Task Assigned',
    message: `You have been assigned to the task "${taskTitle}"`,
    entityType: 'task',
    entityId: taskId
  }
}

/**
 * Creates notification data for overdue task
 */
export function createOverdueTaskNotification(userId: string, taskTitle: string, taskId: string): {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType: 'task'
  entityId: string
} {
  return {
    userId,
    type: 'task_overdue',
    title: 'Task Overdue',
    message: `The task "${taskTitle}" is overdue and needs attention`,
    entityType: 'task',
    entityId: taskId
  }
}

/**
 * Creates notification data for @mention
 */
export function createMentionNotification(userId: string, taskTitle: string, taskId: string, commentSnippet: string): {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType: 'task'
  entityId: string
} {
  return {
    userId,
    type: 'mention',
    title: 'You were mentioned',
    message: `You were mentioned in a comment on task "${taskTitle}": "${commentSnippet}"`,
    entityType: 'task',
    entityId: taskId
  }
}

