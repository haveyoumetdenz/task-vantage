import { describe, it, expect } from 'vitest'
import {
  validateProjectTitle,
  validateProjectStatus,
  validateProjectProgress,
  calculateProjectProgress,
  determineProjectStatus,
  validateProjectDescription,
  validateProjectDates,
  validateTeamMembers,
  getProjectStatistics,
  validateProjectData,
  type Task
} from '@/utils/projectValidation'

describe('Project Validation - TGO-COR-01 (Create Project)', () => {
  describe('validateProjectTitle', () => {
    it('should reject empty title', () => {
      const result = validateProjectTitle('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title is required and cannot be empty')
    })

    it('should reject whitespace-only title', () => {
      const result = validateProjectTitle('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title is required and cannot be empty')
    })

    it('should reject non-string title', () => {
      const result = validateProjectTitle(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title must be a string')
    })

    it('should reject title exceeding 200 characters', () => {
      const longTitle = 'A'.repeat(201)
      const result = validateProjectTitle(longTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Title cannot exceed 200 characters')
    })

    it('should accept valid title', () => {
      const result = validateProjectTitle('Valid Project Title')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept title at maximum length', () => {
      const maxTitle = 'A'.repeat(200)
      const result = validateProjectTitle(maxTitle)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateProjectStatus', () => {
    it('should accept valid statuses', () => {
      expect(validateProjectStatus('active')).toBe(true)
      expect(validateProjectStatus('completed')).toBe(true)
      expect(validateProjectStatus('cancelled')).toBe(true)
    })

    it('should reject invalid statuses', () => {
      expect(validateProjectStatus('invalid')).toBe(false)
      expect(validateProjectStatus('done')).toBe(false)
      expect(validateProjectStatus('')).toBe(false)
      expect(validateProjectStatus('pending')).toBe(false)
    })
  })

  describe('validateProjectProgress', () => {
    it('should reject non-number progress', () => {
      const result = validateProjectProgress('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Progress must be a number')
    })

    it('should reject NaN progress', () => {
      const result = validateProjectProgress(NaN)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Progress must be a number')
    })

    it('should reject negative progress', () => {
      const result = validateProjectProgress(-1)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Progress cannot be negative')
    })

    it('should reject progress above 100', () => {
      const result = validateProjectProgress(101)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Progress cannot exceed 100%')
    })

    it('should accept valid progress values', () => {
      for (let progress = 0; progress <= 100; progress += 25) {
        const result = validateProjectProgress(progress)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      }
    })
  })

  describe('calculateProjectProgress', () => {
    it('should return 0 for empty task array', () => {
      const progress = calculateProjectProgress([])
      expect(progress).toBe(0)
    })

    it('should return 0 for non-array input', () => {
      const progress = calculateProjectProgress(null as any)
      expect(progress).toBe(0)
    })

    it('should calculate 0% progress for no completed tasks', () => {
      const tasks: Task[] = [
        { id: '1', status: 'todo', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'in_progress', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const progress = calculateProjectProgress(tasks)
      expect(progress).toBe(0)
    })

    it('should calculate 50% progress for half completed tasks', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'todo', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const progress = calculateProjectProgress(tasks)
      expect(progress).toBe(50)
    })

    it('should calculate 100% progress for all completed tasks', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'completed', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const progress = calculateProjectProgress(tasks)
      expect(progress).toBe(100)
    })

    it('should round progress to 2 decimal places', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'completed', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '3', status: 'todo', priority: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const progress = calculateProjectProgress(tasks)
      expect(progress).toBe(66.67) // 2/3 * 100, rounded to 2 decimal places
    })
  })

  describe('determineProjectStatus', () => {
    it('should return active for empty task array', () => {
      const status = determineProjectStatus([])
      expect(status).toBe('active')
    })

    it('should return active for non-array input', () => {
      const status = determineProjectStatus(null as any)
      expect(status).toBe('active')
    })

    it('should return completed when all tasks are completed', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'completed', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const status = determineProjectStatus(tasks)
      expect(status).toBe('completed')
    })

    it('should return cancelled when all tasks are cancelled', () => {
      const tasks: Task[] = [
        { id: '1', status: 'cancelled', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'cancelled', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const status = determineProjectStatus(tasks)
      expect(status).toBe('cancelled')
    })

    it('should return active for mixed task statuses', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'todo', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const status = determineProjectStatus(tasks)
      expect(status).toBe('active')
    })

    it('should preserve cancelled status', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const status = determineProjectStatus(tasks, 'cancelled')
      expect(status).toBe('cancelled')
    })
  })

  describe('validateProjectDescription', () => {
    it('should accept undefined description', () => {
      const result = validateProjectDescription(undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept null description', () => {
      const result = validateProjectDescription(null as any)
      expect(result.valid).toBe(true)
    })

    it('should reject non-string description', () => {
      const result = validateProjectDescription(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Description must be a string')
    })

    it('should reject description exceeding 1000 characters', () => {
      const longDescription = 'A'.repeat(1001)
      const result = validateProjectDescription(longDescription)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Description cannot exceed 1000 characters')
    })

    it('should accept valid description', () => {
      const result = validateProjectDescription('Valid project description')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateProjectDates', () => {
    it('should accept undefined dates', () => {
      const result = validateProjectDates(undefined, undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept empty string dates', () => {
      const result = validateProjectDates('', '')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid start date', () => {
      const result = validateProjectDates('invalid-date', undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Start date must be a valid date')
    })

    it('should reject invalid end date', () => {
      const result = validateProjectDates(undefined, 'invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End date must be a valid date')
    })

    it('should reject end date before start date', () => {
      const startDate = '2024-01-15'
      const endDate = '2024-01-10'
      
      const result = validateProjectDates(startDate, endDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End date must be after start date')
    })

    it('should accept valid date range', () => {
      const startDate = '2024-01-10'
      const endDate = '2024-01-15'
      
      const result = validateProjectDates(startDate, endDate)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateTeamMembers', () => {
    it('should accept undefined team members', () => {
      const result = validateTeamMembers(undefined)
      expect(result.valid).toBe(true)
    })

    it('should accept null team members', () => {
      const result = validateTeamMembers(null as any)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array team members', () => {
      const result = validateTeamMembers('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Team members must be an array')
    })

    it('should reject array with empty strings', () => {
      const result = validateTeamMembers(['', 'user-123'])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('All team member IDs must be non-empty strings')
    })

    it('should accept valid team members', () => {
      const result = validateTeamMembers(['user-123', 'user-456'])
      expect(result.valid).toBe(true)
    })
  })

  describe('getProjectStatistics', () => {
    it('should return zero stats for empty array', () => {
      const stats = getProjectStatistics([])
      
      expect(stats.totalTasks).toBe(0)
      expect(stats.completedTasks).toBe(0)
      expect(stats.inProgressTasks).toBe(0)
      expect(stats.todoTasks).toBe(0)
      expect(stats.cancelledTasks).toBe(0)
      expect(stats.progress).toBe(0)
      expect(stats.averagePriority).toBe(0)
    })

    it('should return zero stats for non-array input', () => {
      const stats = getProjectStatistics(null as any)
      
      expect(stats.totalTasks).toBe(0)
      expect(stats.completedTasks).toBe(0)
      expect(stats.progress).toBe(0)
    })

    it('should calculate correct statistics', () => {
      const tasks: Task[] = [
        { id: '1', status: 'completed', priority: 8, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', status: 'in_progress', priority: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '3', status: 'todo', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '4', status: 'cancelled', priority: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      
      const stats = getProjectStatistics(tasks)
      
      expect(stats.totalTasks).toBe(4)
      expect(stats.completedTasks).toBe(1)
      expect(stats.inProgressTasks).toBe(1)
      expect(stats.todoTasks).toBe(1)
      expect(stats.cancelledTasks).toBe(1)
      expect(stats.progress).toBe(25) // 1/4 * 100
      expect(stats.averagePriority).toBe(4.5) // (8+5+3+2)/4
    })
  })

  describe('validateProjectData', () => {
    it('should validate complete valid project data', () => {
      const validProject = {
        title: 'Valid Project',
        description: 'Valid description',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        teamMembers: ['user-123', 'user-456']
      }

      const result = validateProjectData(validProject)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should collect multiple validation errors', () => {
      const invalidProject = {
        title: '', // Invalid: empty
        description: 'A'.repeat(1001), // Invalid: too long
        startDate: 'invalid-date', // Invalid: bad date
        endDate: '2024-01-01', // Invalid: before start date
        teamMembers: [''] // Invalid: empty string
      }

      const result = validateProjectData(invalidProject)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle optional fields correctly', () => {
      const minimalProject = {
        title: 'Minimal Project'
        // All other fields are optional
      }

      const result = validateProjectData(minimalProject)
      expect(result.valid).toBe(true)
    })
  })
})




