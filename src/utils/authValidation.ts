/**
 * Authentication validation utilities
 * Tests: UAA-COR-01, UAA-COR-02, UAA-COR-03
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}

/**
 * Validates password according to requirements
 * Requirements: ≥8 characters, includes letters and numbers
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  
  if (!hasLetter) {
    return { valid: false, error: 'Password must contain at least one letter' }
  }
  
  if (!hasNumber) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

/**
 * Validates password confirmation matches
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords don't match" }
  }
  
  return { valid: true }
}

/**
 * Validates role selection
 */
export function validateRole(role: string): { valid: boolean; error?: string } {
  const validRoles = ['Staff', 'Manager', 'Director', 'Senior Management', 'HR']
  
  if (!role || role.trim().length === 0) {
    return { valid: false, error: 'Role is required' }
  }
  
  if (!validRoles.includes(role)) {
    return { valid: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }
  }
  
  return { valid: true }
}

/**
 * Validates activation link expiration (7 days)
 */
export function isActivationLinkExpired(createdAt: string): boolean {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  
  return daysDiff > 7
}

/**
 * Validates password reset link expiration (24 hours)
 */
export function isPasswordResetLinkExpired(createdAt: string): boolean {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  
  return hoursDiff > 24
}

/**
 * Validates complete authentication data
 */
export function validateAuthData(data: {
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  firstName?: string
  lastName?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (data.email) {
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      errors.push(emailValidation.error!)
    }
  }
  
  if (data.password) {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.error!)
    }
  }
  
  if (data.password && data.confirmPassword) {
    const confirmValidation = validatePasswordConfirmation(data.password, data.confirmPassword)
    if (!confirmValidation.valid) {
      errors.push(confirmValidation.error!)
    }
  }
  
  if (data.role) {
    const roleValidation = validateRole(data.role)
    if (!roleValidation.valid) {
      errors.push(roleValidation.error!)
    }
  }
  
  if (data.firstName !== undefined && (!data.firstName || data.firstName.trim().length === 0)) {
    errors.push('First name is required')
  }
  
  if (data.lastName !== undefined && (!data.lastName || data.lastName.trim().length === 0)) {
    errors.push('Last name is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

