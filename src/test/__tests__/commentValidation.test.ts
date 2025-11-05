import { describe, it, expect } from 'vitest'
import {
  validateCommentContent,
  parseMentions,
  validateCommentData,
  sanitizeCommentContent
} from '@/utils/commentValidation'

describe('Comment Validation - TM-COR-07', () => {
  describe('validateCommentContent', () => {
    it('should reject empty comment', () => {
      const result = validateCommentContent('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should reject whitespace-only comment', () => {
      const result = validateCommentContent('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should reject comment exceeding 5000 characters', () => {
      const longComment = 'a'.repeat(5001)
      const result = validateCommentContent(longComment)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Comment cannot exceed 5000 characters')
    })

    it('should accept valid comment', () => {
      const result = validateCommentContent('This is a valid comment')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept comment with exactly 5000 characters', () => {
      const comment = 'a'.repeat(5000)
      const result = validateCommentContent(comment)
      expect(result.valid).toBe(true)
    })
  })

  describe('parseMentions', () => {
    it('should parse single @mention', () => {
      const mentions = parseMentions('Hello @john, how are you?')
      expect(mentions).toEqual(['john'])
    })

    it('should parse multiple @mentions', () => {
      const mentions = parseMentions('Hello @john and @jane, how are you?')
      expect(mentions).toEqual(['john', 'jane'])
    })

    it('should not duplicate mentions', () => {
      const mentions = parseMentions('Hello @john, @john, and @jane')
      expect(mentions).toEqual(['john', 'jane'])
    })

    it('should return empty array for no mentions', () => {
      const mentions = parseMentions('Hello, how are you?')
      expect(mentions).toEqual([])
    })

    it('should handle mentions at start of comment', () => {
      const mentions = parseMentions('@john please review this')
      expect(mentions).toEqual(['john'])
    })

    it('should handle mentions at end of comment', () => {
      const mentions = parseMentions('Please review this @john')
      expect(mentions).toEqual(['john'])
    })

    it('should ignore invalid mention format', () => {
      const mentions = parseMentions('Hello @ and @123')
      expect(mentions).toEqual(['123']) // Only valid format
    })
  })

  describe('validateCommentData', () => {
    it('should validate complete comment data', () => {
      const result = validateCommentData({
        content: 'This is a valid comment',
        taskId: 'task-123',
        userId: 'user-123'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty content', () => {
      const result = validateCommentData({
        content: '',
        taskId: 'task-123',
        userId: 'user-123'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('empty'))).toBe(true)
    })

    it('should reject missing taskId when provided', () => {
      const result = validateCommentData({
        content: 'Valid comment',
        taskId: '',
        userId: 'user-123'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Task ID'))).toBe(true)
    })

    it('should reject missing userId when provided', () => {
      const result = validateCommentData({
        content: 'Valid comment',
        taskId: 'task-123',
        userId: ''
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('User ID'))).toBe(true)
    })
  })

  describe('sanitizeCommentContent', () => {
    it('should trim whitespace', () => {
      const result = sanitizeCommentContent('  Hello World  ')
      expect(result).toBe('Hello World')
    })

    it('should handle empty string', () => {
      const result = sanitizeCommentContent('')
      expect(result).toBe('')
    })

    it('should preserve content without leading/trailing whitespace', () => {
      const result = sanitizeCommentContent('Hello World')
      expect(result).toBe('Hello World')
    })
  })
})

