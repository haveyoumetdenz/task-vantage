export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: TaskStatus
  priority?: number
  dueDate?: string
  projectId?: string
  assigneeIds?: string[]
  isRecurring?: boolean
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    maxOccurrences?: number
  }
}

/**
 * Validates task title
 * @param title - The task title to validate
 * @returns Validation result with error message if invalid
 */
export function validateTaskTitle(title: string): { valid: boolean; error?: string } {
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' }
  }
  
  if (title.trim().length === 0) {
    return { valid: false, error: 'Title is required and cannot be empty' }
  }
  
  if (title.length > 500) {
    return { valid: false, error: 'Title cannot exceed 500 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates task priority
 * @param priority - The priority value to validate
 * @returns Validation result with error message if invalid
 */
export function validateTaskPriority(priority: number): { valid: boolean; error?: string } {
  if (typeof priority !== 'number' || isNaN(priority)) {
    return { valid: false, error: 'Priority must be a number' }
  }
  
  if (!Number.isInteger(priority)) {
    return { valid: false, error: 'Priority must be an integer' }
  }
  
  if (priority < 1) {
    return { valid: false, error: 'Priority must be at least 1' }
  }
  
  if (priority > 10) {
    return { valid: false, error: 'Priority cannot exceed 10' }
  }
  
  return { valid: true }
}

/**
 * Validates task status
 * @param status - The status string to validate
 * @returns True if status is valid
 */
export function isValidTaskStatus(status: string): status is TaskStatus {
  return ['todo', 'in_progress', 'completed', 'cancelled'].includes(status)
}

/**
 * Validates task description
 * @param description - The description to validate
 * @returns Validation result with error message if invalid
 */
export function validateTaskDescription(description?: string): { valid: boolean; error?: string } {
  if (description === undefined || description === null) {
    return { valid: true } // Description is optional
  }
  
  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' }
  }
  
  if (description.length > 2000) {
    return { valid: false, error: 'Description cannot exceed 2000 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates due date format
 * @param dueDate - The due date string to validate
 * @returns Validation result with error message if invalid
 */
export function validateTaskDueDate(dueDate?: string): { valid: boolean; error?: string } {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return { valid: true } // Due date is optional
  }
  
  if (typeof dueDate !== 'string') {
    return { valid: false, error: 'Due date must be a string' }
  }
  
  const date = new Date(dueDate)
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Due date must be a valid date' }
  }
  
  // Check if date is in the past (more than 1 hour ago)
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  if (date < oneHourAgo) {
    return { valid: false, error: 'Due date cannot be in the past' }
  }
  
  return { valid: true }
}

/**
 * Validates assignee IDs array
 * @param assigneeIds - Array of assignee IDs to validate
 * @returns Validation result with error message if invalid
 */
export function validateAssigneeIds(assigneeIds?: string[]): { valid: boolean; error?: string } {
  if (assigneeIds === undefined || assigneeIds === null) {
    return { valid: true } // Assignee IDs are optional
  }
  
  if (!Array.isArray(assigneeIds)) {
    return { valid: false, error: 'Assignee IDs must be an array' }
  }
  
  if (assigneeIds.length === 0) {
    return { valid: false, error: 'At least one assignee is required' }
  }
  
  for (const id of assigneeIds) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      return { valid: false, error: 'All assignee IDs must be non-empty strings' }
    }
  }
  
  return { valid: true }
}

/**
 * Validates complete task data
 * @param data - The task data to validate
 * @returns Complete validation result with all errors
 */
export function validateTaskData(data: CreateTaskData): ValidationResult {
  const errors: string[] = []
  
  // Validate title (required)
  const titleValidation = validateTaskTitle(data.title)
  if (!titleValidation.valid) {
    errors.push(titleValidation.error!)
  }
  
  // Validate description (optional)
  const descriptionValidation = validateTaskDescription(data.description)
  if (!descriptionValidation.valid) {
    errors.push(descriptionValidation.error!)
  }
  
  // Validate priority (optional, defaults to 5)
  const priority = data.priority ?? 5
  const priorityValidation = validateTaskPriority(priority)
  if (!priorityValidation.valid) {
    errors.push(priorityValidation.error!)
  }
  
  // Validate status (optional, defaults to 'todo')
  if (data.status && !isValidTaskStatus(data.status)) {
    errors.push(`Invalid status: ${data.status}. Must be one of: todo, in_progress, completed, cancelled`)
  }
  
  // Validate due date (optional)
  const dueDateValidation = validateTaskDueDate(data.dueDate)
  if (!dueDateValidation.valid) {
    errors.push(dueDateValidation.error!)
  }
  
  // Validate assignee IDs (optional)
  const assigneeValidation = validateAssigneeIds(data.assigneeIds)
  if (!assigneeValidation.valid) {
    errors.push(assigneeValidation.error!)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes task data by applying defaults and cleaning values
 * @param data - Raw task data
 * @returns Sanitized task data with defaults applied
 */
export function sanitizeTaskData(data: CreateTaskData): CreateTaskData {
  return {
    ...data,
    title: data.title?.trim() || '',
    description: data.description?.trim() || undefined,
    status: data.status || 'todo',
    priority: data.priority || 5,
    assigneeIds: data.assigneeIds || [],
    isRecurring: data.isRecurring || false,
  }
}




