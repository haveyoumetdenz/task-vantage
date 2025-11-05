import { describe, it, expect } from 'vitest'
import {
  canInviteCollaborators,
  validateCollaboratorEmail,
  canAddCollaborator,
  validateCollaboratorInvite,
  canRemoveCollaborator,
  validateCollaboratorRemoval
} from '@/utils/projectCollaborationValidation'

describe('Project Collaboration Validation - TGO-COR-05', () => {
  describe('canInviteCollaborators', () => {
    it('should allow project owner to invite', () => {
      expect(canInviteCollaborators('user-1', 'user-1')).toBe(true)
    })

    it('should reject non-owners from inviting', () => {
      expect(canInviteCollaborators('user-2', 'user-1')).toBe(false)
    })
  })

  describe('validateCollaboratorEmail', () => {
    it('should validate correct email', () => {
      const result = validateCollaboratorEmail('user@example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject empty email', () => {
      const result = validateCollaboratorEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should reject invalid email format', () => {
      const result = validateCollaboratorEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid email')
    })
  })

  describe('canAddCollaborator', () => {
    it('should allow adding new collaborator', () => {
      expect(canAddCollaborator('user-3', ['user-1', 'user-2'], [])).toBe(true)
    })

    it('should reject existing members', () => {
      expect(canAddCollaborator('user-1', ['user-1', 'user-2'], [])).toBe(false)
    })

    it('should reject pending invites', () => {
      expect(canAddCollaborator('user-3', ['user-1'], ['user-3'])).toBe(false)
    })
  })

  describe('validateCollaboratorInvite', () => {
    it('should validate correct invite', () => {
      const result = validateCollaboratorInvite({
        email: 'user@example.com',
        projectId: 'project-1',
        inviterId: 'user-1',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = validateCollaboratorInvite({
        email: 'invalid-email',
        projectId: 'project-1',
        inviterId: 'user-1',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
    })

    it('should reject non-owner invites', () => {
      const result = validateCollaboratorInvite({
        email: 'user@example.com',
        projectId: 'project-1',
        inviterId: 'user-2',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('owners'))).toBe(true)
    })
  })

  describe('canRemoveCollaborator', () => {
    it('should allow project owner to remove', () => {
      expect(canRemoveCollaborator('user-1', 'user-2', 'user-1')).toBe(true)
    })

    it('should allow collaborator to remove themselves', () => {
      expect(canRemoveCollaborator('user-2', 'user-2', 'user-1')).toBe(true)
    })

    it('should reject other collaborators from removing', () => {
      expect(canRemoveCollaborator('user-3', 'user-2', 'user-1')).toBe(false)
    })
  })

  describe('validateCollaboratorRemoval', () => {
    it('should validate correct removal by owner', () => {
      const result = validateCollaboratorRemoval({
        collaboratorId: 'user-2',
        projectId: 'project-1',
        userId: 'user-1',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(true)
    })

    it('should validate correct removal by collaborator', () => {
      const result = validateCollaboratorRemoval({
        collaboratorId: 'user-2',
        projectId: 'project-1',
        userId: 'user-2',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(true)
    })

    it('should reject unauthorized removal', () => {
      const result = validateCollaboratorRemoval({
        collaboratorId: 'user-2',
        projectId: 'project-1',
        userId: 'user-3',
        projectOwnerId: 'user-1'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('owners'))).toBe(true)
    })
  })
})

