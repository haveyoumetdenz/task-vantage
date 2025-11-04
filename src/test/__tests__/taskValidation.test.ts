import { describe, it, expect } from 'vitest'
import {
  validateTaskTitle,
  validateTaskPriority,
  isValidTaskStatus,
  validateTaskDescription,
  validateTaskDueDate,
  validateAssigneeIds,
  validateTaskData,
  sanitizeTaskData,
  type CreateTaskData
} from '@/utils/taskValidation'

describe('Task Validation - TM-COR-01 (Create Task)', () => {
  describe('validateTaskTitle', () => {
    it('should reject empty title', () => {
      const result = validateTaskTitle('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title is required and cannot be empty')
    })

    it('should reject whitespace-only title', () => {
      const result = validateTaskTitle('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title is required and cannot be empty')
    })

    it('should reject non-string title', () => {
      const result = validateTaskTitle(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title must be a string')
    })

    it('should reject title exceeding 500 characters', () => {
      const longTitle = 'A'.repeat(501)
      const result = validateTaskTitle(longTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title cannot exceed 500 characters')
    })

    it('should accept valid title', () => {
      const result = validateTaskTitle('Valid Task Title')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept title at maximum length', () => {
      const maxTitle = 'A'.repeat(500)
      const result = validateTaskTitle(maxTitle)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateTaskPriority', () => {
    it('should reject non-number priority', () => {
      const result = validateTaskPriority('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Priority must be a number')
    })

    it('should reject NaN priority', () => {
      const result = validateTaskPriority(NaN)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Priority must be a number')
    })

    it('should reject non-integer priority', () => {
      const result = validateTaskPriority(5.5)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Priority must be an integer')
    })

    it('should reject priority below 1', () => {
      const result = validateTaskPriority(0)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Priority must be at least 1')
    })

    it('should reject priority above 10', () => {
      const result = validateTaskPriority(11)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Priority cannot exceed 10')
    })

    it('should accept valid priorities', () => {
      for (let priority = 1; priority <= 10; priority++) {
        const result = validateTaskPriority(priority)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      }
    })
  })

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

  describe('validateTaskDescription', () => {
    it('should accept undefined description', () => {
      const result = validateTaskDescription(undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept null description', () => {
      const result = validateTaskDescription(null as any)
      expect(result.valid).toBe(true)
    })

    it('should reject non-string description', () => {
      const result = validateTaskDescription(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Description must be a string')
    })

    it('should reject description exceeding 2000 characters', () => {
      const longDescription = 'A'.repeat(2001)
      const result = validateTaskDescription(longDescription)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Description cannot exceed 2000 characters')
    })

    it('should accept valid description', () => {
      const result = validateTaskDescription('Valid description')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateTaskDueDate', () => {
    it('should accept undefined due date', () => {
      const result = validateTaskDueDate(undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept empty string due date', () => {
      const result = validateTaskDueDate('')
      expect(result.valid).toBe(true)
    })

    it('should reject non-string due date', () => {
      const result = validateTaskDueDate(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Due date must be a string')
    })

    it('should reject invalid date string', () => {
      const result = validateTaskDueDate('invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Due date must be a valid date')
    })

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      const result = validateTaskDueDate(pastDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Due date cannot be in the past')
    })

    it('should accept future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      const result = validateTaskDueDate(futureDate)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateAssigneeIds', () => {
    it('should accept undefined assignee IDs', () => {
      const result = validateAssigneeIds(undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept null assignee IDs', () => {
      const result = validateAssigneeIds(null as any)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array assignee IDs', () => {
      const result = validateAssigneeIds('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Assignee IDs must be an array')
    })

    it('should reject empty assignee IDs array', () => {
      const result = validateAssigneeIds([])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('At least one assignee is required')
    })

    it('should reject array with empty strings', () => {
      const result = validateAssigneeIds(['', 'user-123'])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('All assignee IDs must be non-empty strings')
    })

    it('should accept valid assignee IDs', () => {
      const result = validateAssigneeIds(['user-123', 'user-456'])
      expect(result.valid).toBe(true)
    })
  })

  describe('validateTaskData', () => {
    it('should validate complete valid task data', () => {
      const validTask: CreateTaskData = {
        title: 'Valid Task',
        description: 'Valid description',
        priority: 5,
        status: 'todo',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        assigneeIds: ['user-123']
      }

      const result = validateTaskData(validTask)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should collect multiple validation errors', () => {
      const invalidTask: CreateTaskData = {
        title: '', // Invalid: empty
        priority: 15, // Invalid: too high
        status: 'invalid' as any, // Invalid: not valid status
        assigneeIds: [] // Invalid: empty array
      }

      const result = validateTaskData(invalidTask)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle optional fields correctly', () => {
      const minimalTask: CreateTaskData = {
        title: 'Minimal Task'
        // All other fields are optional
      }

      const result = validateTaskData(minimalTask)
      expect(result.valid).toBe(true)
    })
  })

  describe('sanitizeTaskData', () => {
    it('should apply default values', () => {
      const rawData: CreateTaskData = {
        title: '  Test Task  ',
        description: '  Test Description  '
      }

      const sanitized = sanitizeTaskData(rawData)
      
      expect(sanitized.title).toBe('Test Task')
      expect(sanitized.description).toBe('Test Description')
      expect(sanitized.status).toBe('todo')
      expect(sanitized.priority).toBe(5)
      expect(sanitized.assigneeIds).toEqual([])
      expect(sanitized.isRecurring).toBe(false)
    })

    it('should preserve existing values', () => {
      const rawData: CreateTaskData = {
        title: 'Test Task',
        status: 'in_progress',
        priority: 8,
        assigneeIds: ['user-123'],
        isRecurring: true
      }

      const sanitized = sanitizeTaskData(rawData)
      
      expect(sanitized.status).toBe('in_progress')
      expect(sanitized.priority).toBe(8)
      expect(sanitized.assigneeIds).toEqual(['user-123'])
      expect(sanitized.isRecurring).toBe(true)
    })
  })
})




