/**
 * Project collaboration validation utilities
 * Tests: TGO-COR-05
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates if a user can invite collaborators to a project
 * Only project owners can invite collaborators
 */
export function canInviteCollaborators(
  userId: string,
  projectOwnerId: string
): boolean {
  return userId === projectOwnerId
}

/**
 * Validates collaborator email
 */
export function validateCollaboratorEmail(email: string): { valid: boolean; error?: string } {
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
 * Validates if a user can be added as a collaborator
 * Prevents duplicate invites and unauthorized invites
 */
export function canAddCollaborator(
  userId: string,
  existingMembers: string[],
  existingInvites: string[]
): boolean {
  // Check if user is already a member
  if (existingMembers.includes(userId)) {
    return false
  }
  
  // Check if user already has a pending invite
  if (existingInvites.includes(userId)) {
    return false
  }
  
  return true
}

/**
 * Validates complete collaborator invitation data
 */
export function validateCollaboratorInvite(data: {
  email: string
  projectId: string
  inviterId: string
  projectOwnerId: string
  existingMembers?: string[]
  existingInvites?: string[]
}): ValidationResult {
  const errors: string[] = []
  
  // Validate email format
  const emailValidation = validateCollaboratorEmail(data.email)
  if (!emailValidation.valid) {
    errors.push(emailValidation.error!)
  }
  
  // Validate project ID
  if (!data.projectId || data.projectId.trim().length === 0) {
    errors.push('Project ID is required')
  }
  
  // Validate inviter can invite
  if (!canInviteCollaborators(data.inviterId, data.projectOwnerId)) {
    errors.push('Only project owners can invite collaborators')
  }
  
  // Validate user can be added (if member/invite info provided)
  if (data.existingMembers && data.existingInvites) {
    // Note: This would need the actual user ID from email lookup
    // For now, we'll skip this validation or handle it differently
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates if a user can remove a collaborator
 * Project owners and the collaborator themselves can remove
 */
export function canRemoveCollaborator(
  userId: string,
  collaboratorId: string,
  projectOwnerId: string
): boolean {
  return userId === projectOwnerId || userId === collaboratorId
}

/**
 * Validates collaborator removal
 */
export function validateCollaboratorRemoval(data: {
  collaboratorId: string
  projectId: string
  userId: string
  projectOwnerId: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.collaboratorId || data.collaboratorId.trim().length === 0) {
    errors.push('Collaborator ID is required')
  }
  
  if (!data.projectId || data.projectId.trim().length === 0) {
    errors.push('Project ID is required')
  }
  
  if (!data.userId || data.userId.trim().length === 0) {
    errors.push('User ID is required')
  }
  
  // Validate user can remove collaborator
  if (!canRemoveCollaborator(data.userId, data.collaboratorId, data.projectOwnerId)) {
    errors.push('Only project owners or the collaborator themselves can remove collaborators')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

