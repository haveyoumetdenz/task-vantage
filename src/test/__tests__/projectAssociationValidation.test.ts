import { describe, it, expect } from 'vitest'
import {
  canMoveTaskToProject,
  validateTaskProjectAssociation,
  canRemoveTaskFromProject,
  validateTaskProjectRemoval
} from '@/utils/projectAssociationValidation'

describe('Project Association Validation - TGO-COR-03', () => {
  describe('canMoveTaskToProject', () => {
    it('should allow project owner to move tasks', () => {
      expect(canMoveTaskToProject('user-1', ['user-1', 'user-2'], 'user-1')).toBe(true)
    })

    it('should allow project members to move tasks', () => {
      expect(canMoveTaskToProject('user-2', ['user-1', 'user-2'], 'user-1')).toBe(true)
    })

    it('should reject non-members from moving tasks', () => {
      expect(canMoveTaskToProject('user-3', ['user-1', 'user-2'], 'user-1')).toBe(false)
    })
  })

  describe('validateTaskProjectAssociation', () => {
    it('should validate correct association', () => {
      const result = validateTaskProjectAssociation({
        taskId: 'task-1',
        projectId: 'project-1',
        userId: 'user-1',
        projectMembers: ['user-1', 'user-2'],
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject missing task ID', () => {
      const result = validateTaskProjectAssociation({
        taskId: '',
        projectId: 'project-1',
        userId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Task ID'))).toBe(true)
    })

    it('should reject missing project ID', () => {
      const result = validateTaskProjectAssociation({
        taskId: 'task-1',
        projectId: '',
        userId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Project ID'))).toBe(true)
    })

    it('should reject non-collaborators', () => {
      const result = validateTaskProjectAssociation({
        taskId: 'task-1',
        projectId: 'project-1',
        userId: 'user-3',
        projectMembers: ['user-1', 'user-2'],
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('collaborator'))).toBe(true)
    })
  })

  describe('canRemoveTaskFromProject', () => {
    it('should allow project owner to remove tasks', () => {
      expect(canRemoveTaskFromProject('user-1', ['user-1', 'user-2'], 'user-1')).toBe(true)
    })

    it('should allow project members to remove tasks', () => {
      expect(canRemoveTaskFromProject('user-2', ['user-1', 'user-2'], 'user-1')).toBe(true)
    })
  })

  describe('validateTaskProjectRemoval', () => {
    it('should validate correct removal', () => {
      const result = validateTaskProjectRemoval({
        taskId: 'task-1',
        projectId: 'project-1',
        userId: 'user-1',
        projectMembers: ['user-1', 'user-2'],
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(true)
    })

    it('should reject non-collaborators', () => {
      const result = validateTaskProjectRemoval({
        taskId: 'task-1',
        projectId: 'project-1',
        userId: 'user-3',
        projectMembers: ['user-1', 'user-2'],
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
    })
  })
})

