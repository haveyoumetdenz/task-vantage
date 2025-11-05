import { describe, it, expect } from 'vitest'
import {
  canAssignTasks,
  validateAssigneeIds,
  validateAssigneeScope,
  validateTaskAssignment
} from '@/utils/taskAssignmentValidation'

describe('Task Assignment Validation - TM-COR-06', () => {
  describe('canAssignTasks', () => {
    it('should allow managers to assign tasks', () => {
      expect(canAssignTasks('Manager')).toBe(true)
    })

    it('should allow directors to assign tasks', () => {
      expect(canAssignTasks('Director')).toBe(true)
    })

    it('should allow senior management to assign tasks', () => {
      expect(canAssignTasks('Senior Management')).toBe(true)
    })

    it('should allow HR to assign tasks', () => {
      expect(canAssignTasks('HR')).toBe(true)
    })

    it('should reject staff from assigning tasks', () => {
      expect(canAssignTasks('Staff')).toBe(false)
    })

    it('should reject invalid roles', () => {
      expect(canAssignTasks('Invalid')).toBe(false)
    })
  })

  describe('validateAssigneeIds', () => {
    it('should validate correct assignee IDs', () => {
      const result = validateAssigneeIds(['user-1', 'user-2'])
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty assignee array', () => {
      const result = validateAssigneeIds([])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('required'))).toBe(true)
    })

    it('should reject non-array input', () => {
      const result = validateAssigneeIds('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('array'))).toBe(true)
    })

    it('should reject duplicate IDs', () => {
      const result = validateAssigneeIds(['user-1', 'user-1'])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true)
    })

    it('should reject empty or invalid IDs', () => {
      const result = validateAssigneeIds(['', 'user-2'])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('invalid'))).toBe(true)
    })
  })

  describe('validateAssigneeScope', () => {
    it('should allow senior management to assign to anyone', () => {
      const assigneeTeamMap = new Map([
        ['user-1', ['team-1']],
        ['user-2', ['team-2']]
      ])
      
      const result = validateAssigneeScope(
        ['user-1', 'user-2'],
        'Senior Management',
        ['team-1'],
        assigneeTeamMap
      )
      
      expect(result.valid).toBe(true)
    })

    it('should validate manager can only assign to their team', () => {
      const assigneeTeamMap = new Map([
        ['user-1', ['team-1']],
        ['user-2', ['team-2']]
      ])
      
      const result = validateAssigneeScope(
        ['user-1', 'user-2'],
        'Manager',
        ['team-1'],
        assigneeTeamMap
      )
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('managed teams'))).toBe(true)
    })

    it('should reject staff from assigning tasks', () => {
      const result = validateAssigneeScope(
        ['user-1'],
        'Staff',
        ['team-1'],
        new Map()
      )
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('cannot assign'))).toBe(true)
    })
  })

  describe('validateTaskAssignment', () => {
    it('should validate complete assignment data', () => {
      const assigneeTeamMap = new Map([
        ['user-1', ['team-1']]
      ])
      
      const result = validateTaskAssignment({
        assigneeIds: ['user-1'],
        userRole: 'Manager',
        managedTeamIds: ['team-1'],
        assigneeTeamMap
      })
      
      expect(result.valid).toBe(true)
    })

    it('should reject invalid assignee IDs', () => {
      const result = validateTaskAssignment({
        assigneeIds: [],
        userRole: 'Manager'
      })
      
      expect(result.valid).toBe(false)
    })

    it('should reject staff from assigning', () => {
      const result = validateTaskAssignment({
        assigneeIds: ['user-1'],
        userRole: 'Staff'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('cannot assign'))).toBe(true)
    })
  })
})

