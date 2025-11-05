/**
 * Task status transition validation utilities
 * Tests: TM-COR-03
 */

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates if a status transition is allowed
 */
export function isValidStatusTransition(fromStatus: TaskStatus | string, toStatus: TaskStatus | string): boolean {
  // All statuses can transition to any other status
  // (No business rule restricting transitions)
  const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'completed', 'cancelled']
  
  return validStatuses.includes(fromStatus as TaskStatus) && validStatuses.includes(toStatus as TaskStatus)
}

/**
 * Validates task status
 */
export function isValidTaskStatus(status: string): status is TaskStatus {
  return ['todo', 'in_progress', 'completed', 'cancelled'].includes(status)
}

/**
 * Validates status transition with detailed error messages
 */
export function validateStatusTransition(fromStatus: TaskStatus | string, toStatus: TaskStatus | string): ValidationResult {
  const errors: string[] = []
  
  if (!isValidTaskStatus(fromStatus)) {
    errors.push(`Invalid current status: ${fromStatus}. Must be one of: todo, in_progress, completed, cancelled`)
  }
  
  if (!isValidTaskStatus(toStatus)) {
    errors.push(`Invalid target status: ${toStatus}. Must be one of: todo, in_progress, completed, cancelled`)
  }
  
  if (errors.length === 0 && !isValidStatusTransition(fromStatus, toStatus)) {
    errors.push(`Cannot transition from ${fromStatus} to ${toStatus}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Gets the default status for a new task
 */
export function getDefaultTaskStatus(): TaskStatus {
  return 'todo'
}

/**
 * Updates the last updated timestamp
 */
export function updateLastModifiedTimestamp(existingTimestamp?: string): string {
  return new Date().toISOString()
}

