import { describe, it, expect } from 'vitest'
import {
  validateSubtaskTitle,
  isValidSubtaskStatus,
  validateSubtaskData,
  getDefaultSubtaskStatus,
  sanitizeSubtaskData
} from '@/utils/subtaskValidation'

describe('Subtask Validation - TGO-COR-04', () => {
  describe('validateSubtaskTitle', () => {
    it('should reject empty title', () => {
      const result = validateSubtaskTitle('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Subtask title is required')
    })

    it('should reject whitespace-only title', () => {
      const result = validateSubtaskTitle('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Subtask title is required')
    })

    it('should reject title exceeding 200 characters', () => {
      const longTitle = 'a'.repeat(201)
      const result = validateSubtaskTitle(longTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Subtask title cannot exceed 200 characters')
    })

    it('should accept valid title', () => {
      const result = validateSubtaskTitle('Valid Subtask Title')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept title with exactly 200 characters', () => {
      const title = 'a'.repeat(200)
      const result = validateSubtaskTitle(title)
      expect(result.valid).toBe(true)
    })
  })

  describe('isValidSubtaskStatus', () => {
    it('should accept valid statuses', () => {
      expect(isValidSubtaskStatus('open')).toBe(true)
      expect(isValidSubtaskStatus('in_progress')).toBe(true)
      expect(isValidSubtaskStatus('done')).toBe(true)
    })

    it('should reject invalid statuses', () => {
      expect(isValidSubtaskStatus('invalid')).toBe(false)
      expect(isValidSubtaskStatus('completed')).toBe(false)
      expect(isValidSubtaskStatus('')).toBe(false)
      expect(isValidSubtaskStatus('todo')).toBe(false)
    })
  })

  describe('validateSubtaskData', () => {
    it('should validate complete subtask data', () => {
      const result = validateSubtaskData({
        title: 'Valid Subtask',
        status: 'open',
        taskId: 'task-123',
        assigneeId: 'user-123'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty title', () => {
      const result = validateSubtaskData({
        title: '',
        taskId: 'task-123'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('required'))).toBe(true)
    })

    it('should reject invalid status', () => {
      const result = validateSubtaskData({
        title: 'Valid Subtask',
        status: 'invalid' as any,
        taskId: 'task-123'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid status'))).toBe(true)
    })

    it('should reject missing taskId when provided', () => {
      const result = validateSubtaskData({
        title: 'Valid Subtask',
        taskId: ''
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Task ID'))).toBe(true)
    })
  })

  describe('getDefaultSubtaskStatus', () => {
    it('should return open as default status', () => {
      expect(getDefaultSubtaskStatus()).toBe('open')
    })
  })

  describe('sanitizeSubtaskData', () => {
    it('should trim title and apply defaults', () => {
      const result = sanitizeSubtaskData({
        title: '  Subtask Title  ',
        taskId: 'task-123'
      })
      
      expect(result.title).toBe('Subtask Title')
      expect(result.status).toBe('open')
      expect(result.taskId).toBe('task-123')
    })

    it('should preserve provided status', () => {
      const result = sanitizeSubtaskData({
        title: 'Subtask Title',
        status: 'in_progress',
        taskId: 'task-123'
      })
      
      expect(result.status).toBe('in_progress')
    })

    it('should handle optional fields', () => {
      const result = sanitizeSubtaskData({
        title: 'Subtask Title',
        assigneeId: 'user-123'
      })
      
      expect(result.assigneeId).toBe('user-123')
      expect(result.taskId).toBeUndefined()
    })
  })
})

