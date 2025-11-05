/**
 * Task-to-project association validation utilities
 * Tests: TGO-COR-03
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates if a task can be moved to a project
 * Any project collaborator (member or owner) can move tasks
 */
export function canMoveTaskToProject(
  userId: string,
  projectMembers: string[],
  projectOwnerId: string
): boolean {
  return projectMembers.includes(userId) || userId === projectOwnerId
}

/**
 * Validates task-to-project association
 */
export function validateTaskProjectAssociation(data: {
  taskId: string
  projectId: string
  userId: string
  projectMembers?: string[]
  projectOwnerId?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.taskId || data.taskId.trim().length === 0) {
    errors.push('Task ID is required')
  }
  
  if (!data.projectId || data.projectId.trim().length === 0) {
    errors.push('Project ID is required')
  }
  
  if (!data.userId || data.userId.trim().length === 0) {
    errors.push('User ID is required')
  }
  
  // Validate user can move task to project if project info provided
  if (data.projectMembers && data.projectOwnerId) {
    if (!canMoveTaskToProject(data.userId, data.projectMembers, data.projectOwnerId)) {
      errors.push('User is not a collaborator on this project')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates if a task can be removed from a project
 */
export function canRemoveTaskFromProject(
  userId: string,
  projectMembers: string[],
  projectOwnerId: string
): boolean {
  return canMoveTaskToProject(userId, projectMembers, projectOwnerId)
}

/**
 * Validates task removal from project
 */
export function validateTaskProjectRemoval(data: {
  taskId: string
  projectId: string
  userId: string
  projectMembers?: string[]
  projectOwnerId?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (!data.taskId || data.taskId.trim().length === 0) {
    errors.push('Task ID is required')
  }
  
  if (!data.projectId || data.projectId.trim().length === 0) {
    errors.push('Project ID is required')
  }
  
  if (!data.userId || data.userId.trim().length === 0) {
    errors.push('User ID is required')
  }
  
  // Validate user can remove task from project if project info provided
  if (data.projectMembers && data.projectOwnerId) {
    if (!canRemoveTaskFromProject(data.userId, data.projectMembers, data.projectOwnerId)) {
      errors.push('User is not a collaborator on this project')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

