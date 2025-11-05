/**
 * Subtask validation utilities
 * Tests: TGO-COR-04
 */

export type SubtaskStatus = 'open' | 'in_progress' | 'done'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates subtask title
 */
export function validateSubtaskTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Subtask title is required' }
  }
  
  if (title.length > 200) {
    return { valid: false, error: 'Subtask title cannot exceed 200 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates subtask status
 */
export function isValidSubtaskStatus(status: string): status is SubtaskStatus {
  return ['open', 'in_progress', 'done'].includes(status)
}

/**
 * Validates complete subtask data
 */
export function validateSubtaskData(data: {
  title: string
  status?: SubtaskStatus
  taskId?: string
  assigneeId?: string
}): ValidationResult {
  const errors: string[] = []
  
  const titleValidation = validateSubtaskTitle(data.title)
  if (!titleValidation.valid) {
    errors.push(titleValidation.error!)
  }
  
  if (data.status !== undefined && !isValidSubtaskStatus(data.status)) {
    errors.push(`Invalid status: ${data.status}. Must be one of: open, in_progress, done`)
  }
  
  if (data.taskId !== undefined && (!data.taskId || data.taskId.trim().length === 0)) {
    errors.push('Task ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Gets the default status for a new subtask
 */
export function getDefaultSubtaskStatus(): SubtaskStatus {
  return 'open'
}

/**
 * Sanitizes subtask data by applying defaults
 */
export function sanitizeSubtaskData(data: {
  title: string
  status?: SubtaskStatus
  taskId?: string
  assigneeId?: string
}): {
  title: string
  status: SubtaskStatus
  taskId?: string
  assigneeId?: string
} {
  return {
    title: data.title.trim(),
    status: data.status || getDefaultSubtaskStatus(),
    taskId: data.taskId,
    assigneeId: data.assigneeId
  }
}

