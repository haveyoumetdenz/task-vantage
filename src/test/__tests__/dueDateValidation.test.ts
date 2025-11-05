import { describe, it, expect } from 'vitest'
import {
  validateDueDate,
  isTaskOverdue,
  isTaskDueSoon,
  getDeadlineStatus,
  formatDueDate,
  validateDueDateData
} from '@/utils/dueDateValidation'

describe('Due Date Validation - DST-COR-01', () => {
  describe('validateDueDate', () => {
    it('should accept null/undefined due date (optional)', () => {
      expect(validateDueDate(null).valid).toBe(true)
      expect(validateDueDate(undefined).valid).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = validateDueDate('invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid date format')
    })

    it('should accept valid ISO date string', () => {
      const result = validateDueDate('2025-12-31T23:59:59Z')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid date string', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      const result = validateDueDate(futureDate.toISOString())
      expect(result.valid).toBe(true)
    })
  })

  describe('isTaskOverdue', () => {
    it('should return false for completed task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'completed')).toBe(false)
    })

    it('should return false for cancelled task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'cancelled')).toBe(false)
    })

    it('should return false for task with completedAt', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'todo', new Date().toISOString())).toBe(false)
    })

    it('should return false for future due date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      expect(isTaskOverdue(futureDate.toISOString(), 'todo')).toBe(false)
    })

    it('should return true for overdue task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(isTaskOverdue(pastDate.toISOString(), 'todo')).toBe(true)
    })

    it('should return false for null due date', () => {
      expect(isTaskOverdue(null, 'todo')).toBe(false)
    })
  })

  describe('isTaskDueSoon', () => {
    it('should return false for completed task', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'completed')).toBe(false)
    })

    it('should return false for cancelled task', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'cancelled')).toBe(false)
    })

    it('should return false for overdue task', () => {
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 1)
      
      expect(isTaskDueSoon(pastDate.toISOString(), 'todo')).toBe(false)
    })

    it('should return true for task due within 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(true)
    })

    it('should return true for task due in exactly 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 24)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(true)
    })

    it('should return false for task due in more than 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 25)
      
      expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(false)
    })

    it('should return false for null due date', () => {
      expect(isTaskDueSoon(null, 'todo')).toBe(false)
    })
  })

  describe('getDeadlineStatus', () => {
    it('should return completed for completed task', () => {
      expect(getDeadlineStatus('2025-12-31', 'completed')).toBe('completed')
    })

    it('should return completed for task with completedAt', () => {
      expect(getDeadlineStatus('2025-12-31', 'todo', new Date().toISOString())).toBe('completed')
    })

    it('should return normal for null due date', () => {
      expect(getDeadlineStatus(null, 'todo')).toBe('normal')
    })

    it('should return overdue for overdue task', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(getDeadlineStatus(pastDate.toISOString(), 'todo')).toBe('overdue')
    })

    it('should return due_soon for task due within 24 hours', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 12)
      
      expect(getDeadlineStatus(futureDate.toISOString(), 'todo')).toBe('due_soon')
    })

    it('should return normal for task due in more than 24 hours', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      expect(getDeadlineStatus(futureDate.toISOString(), 'todo')).toBe('normal')
    })
  })

  describe('formatDueDate', () => {
    it('should return empty string for null due date', () => {
      expect(formatDueDate(null)).toBe('')
    })

    it('should return empty string for invalid date', () => {
      expect(formatDueDate('invalid-date')).toBe('')
    })

    it('should format valid date', () => {
      const date = new Date('2025-12-31T23:59:59')
      const formatted = formatDueDate(date.toISOString())
      
      expect(formatted).toBeDefined()
      expect(formatted.length).toBeGreaterThan(0)
      expect(formatted).toContain('Dec')
      expect(formatted).toContain('31')
      expect(formatted).toContain('2025')
    })
  })

  describe('validateDueDateData', () => {
    it('should validate valid due date data', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      const result = validateDueDateData({
        dueDate: futureDate.toISOString(),
        status: 'todo'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should accept null due date', () => {
      const result = validateDueDateData({
        dueDate: null,
        status: 'todo'
      })
      
      expect(result.valid).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = validateDueDateData({
        dueDate: 'invalid-date',
        status: 'todo'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})

