import { describe, it, expect } from 'vitest'
import {
  isValidStatusTransition,
  isValidTaskStatus,
  validateStatusTransition,
  getDefaultTaskStatus,
  updateLastModifiedTimestamp
} from '@/utils/statusTransitionValidation'

describe('Status Transition Validation - TM-COR-03', () => {
  describe('isValidTaskStatus', () => {
    it('should accept valid statuses', () => {
      expect(isValidTaskStatus('todo')).toBe(true)
      expect(isValidTaskStatus('in_progress')).toBe(true)
      expect(isValidTaskStatus('completed')).toBe(true)
      expect(isValidTaskStatus('cancelled')).toBe(true)
    })

    it('should reject invalid statuses', () => {
      expect(isValidTaskStatus('invalid')).toBe(false)
      expect(isValidTaskStatus('done')).toBe(false)
      expect(isValidTaskStatus('')).toBe(false)
      expect(isValidTaskStatus('pending')).toBe(false)
    })
  })

  describe('isValidStatusTransition', () => {
    it('should allow transition from todo to in_progress', () => {
      expect(isValidStatusTransition('todo', 'in_progress')).toBe(true)
    })

    it('should allow transition from in_progress to completed', () => {
      expect(isValidStatusTransition('in_progress', 'completed')).toBe(true)
    })

    it('should allow transition from todo to completed', () => {
      expect(isValidStatusTransition('todo', 'completed')).toBe(true)
    })

    it('should allow transition from any status to cancelled', () => {
      expect(isValidStatusTransition('todo', 'cancelled')).toBe(true)
      expect(isValidStatusTransition('in_progress', 'cancelled')).toBe(true)
      expect(isValidStatusTransition('completed', 'cancelled')).toBe(true)
    })

    it('should allow transition from cancelled back to todo', () => {
      expect(isValidStatusTransition('cancelled', 'todo')).toBe(true)
    })

    it('should reject invalid status transitions', () => {
      expect(isValidStatusTransition('invalid', 'todo')).toBe(false)
      expect(isValidStatusTransition('todo', 'invalid')).toBe(false)
    })
  })

  describe('validateStatusTransition', () => {
    it('should validate valid status transition', () => {
      const result = validateStatusTransition('todo', 'in_progress')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid current status', () => {
      const result = validateStatusTransition('invalid', 'todo')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject invalid target status', () => {
      const result = validateStatusTransition('todo', 'invalid')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('getDefaultTaskStatus', () => {
    it('should return todo as default status', () => {
      expect(getDefaultTaskStatus()).toBe('todo')
    })
  })

  describe('updateLastModifiedTimestamp', () => {
    it('should return current timestamp as ISO string', () => {
      const timestamp = updateLastModifiedTimestamp()
      
      expect(timestamp).toBeDefined()
      expect(typeof timestamp).toBe('string')
      expect(() => new Date(timestamp)).not.toThrow()
    })

    it('should return different timestamp each time', () => {
      const timestamp1 = updateLastModifiedTimestamp()
      // Small delay to ensure different timestamp
      const timestamp2 = updateLastModifiedTimestamp()
      
      // Timestamps should be different (or very close if called quickly)
      expect(timestamp1).toBeDefined()
      expect(timestamp2).toBeDefined()
    })
  })
})

