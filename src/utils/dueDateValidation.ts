/**
 * Due date validation utilities
 * Tests: DST-COR-01
 */

import { isValid, isPast, isFuture, differenceInHours, differenceInDays } from 'date-fns'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export type DeadlineStatus = 'overdue' | 'due_soon' | 'normal' | 'completed'

/**
 * Validates due date format and value
 */
export function validateDueDate(dueDate: string | null | undefined): { valid: boolean; error?: string } {
  if (!dueDate) {
    return { valid: true } // Due date is optional
  }
  
  const date = new Date(dueDate)
  
  if (!isValid(date)) {
    return { valid: false, error: 'Invalid date format' }
  }
  
  return { valid: true }
}

/**
 * Checks if a task is overdue
 */
export function isTaskOverdue(dueDate: string | null | undefined, status: string, completedAt?: string | null): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled' || completedAt) {
    return false
  }
  
  const due = new Date(dueDate)
  const now = new Date()
  
  return isPast(due) && !isValid(due) === false
}

/**
 * Checks if a task is due soon (within 24 hours)
 */
export function isTaskDueSoon(dueDate: string | null | undefined, status: string, completedAt?: string | null): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled' || completedAt) {
    return false
  }
  
  const due = new Date(dueDate)
  const now = new Date()
  
  if (isPast(due)) {
    return false // Already past
  }
  
  const hoursUntilDue = differenceInHours(due, now)
  
  return hoursUntilDue > 0 && hoursUntilDue <= 24
}

/**
 * Gets deadline status for a task
 */
export function getDeadlineStatus(
  dueDate: string | null | undefined,
  status: string,
  completedAt?: string | null
): DeadlineStatus {
  if (status === 'completed' || completedAt) {
    return 'completed'
  }
  
  if (!dueDate) {
    return 'normal'
  }
  
  if (isTaskOverdue(dueDate, status, completedAt)) {
    return 'overdue'
  }
  
  if (isTaskDueSoon(dueDate, status, completedAt)) {
    return 'due_soon'
  }
  
  return 'normal'
}

/**
 * Formats due date for display
 */
export function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) {
    return ''
  }
  
  const date = new Date(dueDate)
  
  if (!isValid(date)) {
    return ''
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

/**
 * Validates complete due date data
 */
export function validateDueDateData(data: {
  dueDate?: string | null
  status?: string
}): ValidationResult {
  const errors: string[] = []
  
  if (data.dueDate !== undefined && data.dueDate !== null) {
    const dueDateValidation = validateDueDate(data.dueDate)
    if (!dueDateValidation.valid) {
      errors.push(dueDateValidation.error!)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

