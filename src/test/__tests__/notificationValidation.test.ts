import { describe, it, expect } from 'vitest'
import {
  isValidNotificationType,
  validateNotificationTitle,
  validateNotificationMessage,
  validateNotificationData,
  isTaskOverdue,
  isTaskDueSoon,
  createTaskAssignmentNotification,
  createOverdueTaskNotification,
  createMentionNotification
} from '@/utils/notificationValidation'

describe('Notification Validation - NS-COR-01, NS-COR-02, NS-COR-04', () => {
  describe('isValidNotificationType', () => {
    it('should accept valid notification types', () => {
      const validTypes = [
        'mention',
        'task_assigned',
        'task_completed',
        'task_overdue',
        'task_due_soon',
        'project_assigned',
        'project_completed',
        'comment'
      ]
      
      validTypes.forEach(type => {
        expect(isValidNotificationType(type)).toBe(true)
      })
    })

    it('should reject invalid notification types', () => {
      expect(isValidNotificationType('invalid')).toBe(false)
      expect(isValidNotificationType('')).toBe(false)
      expect(isValidNotificationType('task_update')).toBe(false)
    })
  })

  describe('validateNotificationTitle', () => {
    it('should reject empty title', () => {
      const result = validateNotificationTitle('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Notification title is required')
    })

    it('should reject title exceeding 200 characters', () => {
      const longTitle = 'a'.repeat(201)
      const result = validateNotificationTitle(longTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Notification title cannot exceed 200 characters')
    })

    it('should accept valid title', () => {
      const result = validateNotificationTitle('Task Assigned')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateNotificationMessage', () => {
    it('should reject empty message', () => {
      const result = validateNotificationMessage('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Notification message is required')
    })

    it('should reject message exceeding 1000 characters', () => {
      const longMessage = 'a'.repeat(1001)
      const result = validateNotificationMessage(longMessage)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Notification message cannot exceed 1000 characters')
    })

    it('should accept valid message', () => {
      const result = validateNotificationMessage('You have been assigned to a task')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateNotificationData', () => {
    it('should validate complete notification data', () => {
      const result = validateNotificationData({
        userId: 'user-123',
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'You have been assigned to a task',
        entityType: 'task',
        entityId: 'task-123'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject missing userId', () => {
      const result = validateNotificationData({
        userId: '',
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'Message'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('User ID'))).toBe(true)
    })

    it('should reject invalid notification type', () => {
      const result = validateNotificationData({
        userId: 'user-123',
        type: 'invalid',
        title: 'Task Assigned',
        message: 'Message'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid notification type'))).toBe(true)
    })
  })

  describe('isTaskOverdue', () => {
    it('should return false for completed task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'completed')).toBe(false)
    })

    it('should return true for overdue task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'todo')).toBe(true)
    })

    it('should return false for future due date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      expect(isTaskOverdue(futureDate.toISOString(), 'todo')).toBe(false)
    })
  })

  describe('isTaskDueSoon', () => {
    it('should return false for completed task', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'completed')).toBe(false)
    })

    it('should return true for task due within 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(true)
    })

    it('should return false for task due in more than 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 25)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(false)
    })
  })

  describe('createTaskAssignmentNotification', () => {
    it('should create valid notification object', () => {
      const notification = createTaskAssignmentNotification('user-123', 'Test Task', 'task-123')
      
      expect(notification.userId).toBe('user-123')
      expect(notification.type).toBe('task_assigned')
      expect(notification.title).toBe('Task Assigned')
      expect(notification.message).toContain('Test Task')
      expect(notification.entityType).toBe('task')
      expect(notification.entityId).toBe('task-123')
    })
  })

  describe('createOverdueTaskNotification', () => {
    it('should create valid overdue notification', () => {
      const notification = createOverdueTaskNotification('user-123', 'Overdue Task', 'task-123')
      
      expect(notification.userId).toBe('user-123')
      expect(notification.type).toBe('task_overdue')
      expect(notification.title).toBe('Task Overdue')
      expect(notification.message).toContain('Overdue Task')
      expect(notification.message).toContain('overdue')
    })
  })

  describe('createMentionNotification', () => {
    it('should create valid mention notification', () => {
      const notification = createMentionNotification(
        'user-123',
        'Test Task',
        'task-123',
        'Please review this'
      )
      
      expect(notification.userId).toBe('user-123')
      expect(notification.type).toBe('mention')
      expect(notification.title).toBe('You were mentioned')
      expect(notification.message).toContain('Test Task')
      expect(notification.message).toContain('Please review this')
    })
  })
})

