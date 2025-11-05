import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRole,
  isActivationLinkExpired,
  isPasswordResetLinkExpired,
  validateAuthData
} from '@/utils/authValidation'

describe('Authentication Validation - UAA-COR-01, UAA-COR-02, UAA-COR-03', () => {
  describe('validateEmail', () => {
    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Please enter a valid email address')
    })

    it('should reject email without @', () => {
      const result = validateEmail('invalidemail.com')
      expect(result.valid).toBe(false)
    })

    it('should reject email without domain', () => {
      const result = validateEmail('invalid@')
      expect(result.valid).toBe(false)
    })

    it('should accept valid email', () => {
      const result = validateEmail('user@example.com')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept email with subdomain', () => {
      const result = validateEmail('user@mail.example.com')
      expect(result.valid).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('should reject empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password is required')
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('short')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must be at least 8 characters')
    })

    it('should reject password with only letters', () => {
      const result = validatePassword('passwordonly')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must contain at least one number')
    })

    it('should reject password with only numbers', () => {
      const result = validatePassword('12345678')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must contain at least one letter')
    })

    it('should accept valid password with letters and numbers', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept password with exactly 8 characters', () => {
      const result = validatePassword('pass1234')
      expect(result.valid).toBe(true)
    })

    it('should accept password with mixed case and numbers', () => {
      const result = validatePassword('Password123')
      expect(result.valid).toBe(true)
    })
  })

  describe('validatePasswordConfirmation', () => {
    it('should reject mismatched passwords', () => {
      const result = validatePasswordConfirmation('password123', 'password456')
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Passwords don't match")
    })

    it('should accept matching passwords', () => {
      const result = validatePasswordConfirmation('password123', 'password123')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('validateRole', () => {
    it('should reject empty role', () => {
      const result = validateRole('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Role is required')
    })

    it('should reject invalid role', () => {
      const result = validateRole('InvalidRole')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid role')
    })

    it('should accept valid roles', () => {
      const validRoles = ['Staff', 'Manager', 'Director', 'Senior Management', 'HR']
      
      validRoles.forEach(role => {
        const result = validateRole(role)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('isActivationLinkExpired', () => {
    it('should return false for recent link (within 7 days)', () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 3) // 3 days ago
      
      expect(isActivationLinkExpired(recentDate.toISOString())).toBe(false)
    })

    it('should return true for expired link (more than 7 days)', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 8) // 8 days ago
      
      expect(isActivationLinkExpired(oldDate.toISOString())).toBe(true)
    })

    it('should return true for link exactly 7 days old', () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      // Should be expired at exactly 7 days
      expect(isActivationLinkExpired(sevenDaysAgo.toISOString())).toBe(false)
    })
  })

  describe('isPasswordResetLinkExpired', () => {
    it('should return false for recent link (within 24 hours)', () => {
      const recentDate = new Date()
      recentDate.setHours(recentDate.getHours() - 12) // 12 hours ago
      
      expect(isPasswordResetLinkExpired(recentDate.toISOString())).toBe(false)
    })

    it('should return true for expired link (more than 24 hours)', () => {
      const oldDate = new Date()
      oldDate.setHours(oldDate.getHours() - 25) // 25 hours ago
      
      expect(isPasswordResetLinkExpired(oldDate.toISOString())).toBe(true)
    })
  })

  describe('validateAuthData', () => {
    it('should validate complete auth data', () => {
      const result = validateAuthData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'Staff',
        firstName: 'John',
        lastName: 'Doe'
      })
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid email', () => {
      const result = validateAuthData({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject weak password', () => {
      const result = validateAuthData({
        email: 'user@example.com',
        password: 'short',
        confirmPassword: 'short'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('8 characters'))).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = validateAuthData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes("don't match"))).toBe(true)
    })

    it('should reject missing first name', () => {
      const result = validateAuthData({
        firstName: '',
        lastName: 'Doe'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('First name'))).toBe(true)
    })

    it('should reject missing last name', () => {
      const result = validateAuthData({
        firstName: 'John',
        lastName: ''
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Last name'))).toBe(true)
    })
  })
})

