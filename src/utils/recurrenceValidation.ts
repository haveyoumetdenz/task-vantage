export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type RecurrenceEndCondition = 'never' | 'after' | 'until'

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency
  interval: number
  endCondition: RecurrenceEndCondition
  endValue?: number | string // number for 'after', string (date) for 'until'
  startDate: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates recurrence frequency
 * @param frequency - The frequency string to validate
 * @returns True if frequency is valid
 */
export function validateRecurrenceFrequency(frequency: string): frequency is RecurrenceFrequency {
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)
}

/**
 * Validates recurrence interval
 * @param interval - The interval number to validate
 * @returns Validation result with error message if invalid
 */
export function validateRecurrenceInterval(interval: number): { valid: boolean; error?: string } {
  if (typeof interval !== 'number' || isNaN(interval)) {
    return { valid: false, error: 'Interval must be a number' }
  }
  
  if (!Number.isInteger(interval)) {
    return { valid: false, error: 'Interval must be an integer' }
  }
  
  if (interval < 1) {
    return { valid: false, error: 'Interval must be at least 1' }
  }
  
  if (interval > 365) {
    return { valid: false, error: 'Interval cannot exceed 365' }
  }
  
  return { valid: true }
}

/**
 * Validates recurrence end condition
 * @param condition - The end condition string to validate
 * @returns True if condition is valid
 */
export function validateRecurrenceEndCondition(condition: string): condition is RecurrenceEndCondition {
  return ['never', 'after', 'until'].includes(condition)
}

/**
 * Validates start date for recurrence
 * @param startDate - The start date string to validate
 * @returns Validation result with error message if invalid
 */
export function validateRecurrenceStartDate(startDate: string): { valid: boolean; error?: string } {
  if (typeof startDate !== 'string' || startDate.trim().length === 0) {
    return { valid: false, error: 'Start date is required' }
  }
  
  const date = new Date(startDate)
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Start date must be a valid date' }
  }
  
  // Check if start date is in the past (more than 1 hour ago)
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  if (date < oneHourAgo) {
    return { valid: false, error: 'Start date cannot be in the past' }
  }
  
  return { valid: true }
}

/**
 * Validates end value based on end condition
 * @param endCondition - The end condition
 * @param endValue - The end value to validate
 * @returns Validation result with error message if invalid
 */
export function validateRecurrenceEndValue(
  endCondition: RecurrenceEndCondition, 
  endValue?: number | string
): { valid: boolean; error?: string } {
  if (endCondition === 'never') {
    return { valid: true } // No end value needed for 'never'
  }
  
  if (endCondition === 'after') {
    if (endValue === undefined || endValue === null) {
      return { valid: false, error: 'End value is required for "after" condition' }
    }
    
    if (typeof endValue !== 'number' || isNaN(endValue)) {
      return { valid: false, error: 'End value must be a number for "after" condition' }
    }
    
    if (!Number.isInteger(endValue) || endValue < 1) {
      return { valid: false, error: 'End value must be a positive integer for "after" condition' }
    }
    
    if (endValue > 1000) {
      return { valid: false, error: 'End value cannot exceed 1000 for "after" condition' }
    }
  }
  
  if (endCondition === 'until') {
    if (endValue === undefined || endValue === null) {
      return { valid: false, error: 'End value is required for "until" condition' }
    }
    
    if (typeof endValue !== 'string') {
      return { valid: false, error: 'End value must be a string (date) for "until" condition' }
    }
    
    const date = new Date(endValue)
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'End value must be a valid date for "until" condition' }
    }
  }
  
  return { valid: true }
}

/**
 * Calculates the number of recurring instances based on configuration
 * @param config - The recurrence configuration
 * @returns Number of instances that will be generated
 */
export function calculateRecurringInstances(config: RecurrenceConfig): number {
  if (config.endCondition === 'never') {
    return 365 // Maximum for display purposes
  }
  
  if (config.endCondition === 'after') {
    return Math.floor((config.endValue as number) / config.interval)
  }
  
  if (config.endCondition === 'until') {
    const startDate = new Date(config.startDate)
    const endDate = new Date(config.endValue as string)
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    switch (config.frequency) {
      case 'daily':
        return Math.floor(diffDays / config.interval)
      case 'weekly':
        return Math.floor(diffDays / (7 * config.interval))
      case 'monthly':
        return Math.floor(diffDays / (30 * config.interval))
      case 'yearly':
        return Math.floor(diffDays / (365 * config.interval))
      default:
        return 0
    }
  }
  
  return 0
}

/**
 * Validates complete recurrence configuration
 * @param config - The recurrence configuration to validate
 * @returns Complete validation result with all errors
 */
export function validateRecurrenceConfig(config: RecurrenceConfig): ValidationResult {
  const errors: string[] = []
  
  // Validate frequency
  if (!validateRecurrenceFrequency(config.frequency)) {
    errors.push(`Invalid frequency: ${config.frequency}. Must be one of: daily, weekly, monthly, yearly`)
  }
  
  // Validate interval
  const intervalValidation = validateRecurrenceInterval(config.interval)
  if (!intervalValidation.valid) {
    errors.push(intervalValidation.error!)
  }
  
  // Validate end condition
  if (!validateRecurrenceEndCondition(config.endCondition)) {
    errors.push(`Invalid end condition: ${config.endCondition}. Must be one of: never, after, until`)
  }
  
  // Validate start date
  const startDateValidation = validateRecurrenceStartDate(config.startDate)
  if (!startDateValidation.valid) {
    errors.push(startDateValidation.error!)
  }
  
  // Validate end value based on condition
  const endValueValidation = validateRecurrenceEndValue(config.endCondition, config.endValue)
  if (!endValueValidation.valid) {
    errors.push(endValueValidation.error!)
  }
  
  // Additional business logic validation
  if (config.endCondition === 'until' && config.startDate && config.endValue) {
    const startDate = new Date(config.startDate)
    const endDate = new Date(config.endValue as string)
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generates recurring task dates based on configuration
 * @param config - The recurrence configuration
 * @param maxInstances - Maximum number of instances to generate (default: 100)
 * @returns Array of date strings for recurring instances
 */
export function generateRecurringDates(
  config: RecurrenceConfig, 
  maxInstances: number = 100
): string[] {
  const dates: string[] = []
  const startDate = new Date(config.startDate)
  let currentDate = new Date(startDate)
  
  const maxCount = Math.min(
    calculateRecurringInstances(config),
    maxInstances
  )
  
  for (let i = 0; i < maxCount; i++) {
    dates.push(currentDate.toISOString())
    
    // Calculate next occurrence
    switch (config.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + config.interval)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * config.interval))
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + config.interval)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + config.interval)
        break
    }
    
    // Check if we've exceeded the end date for 'until' condition
    if (config.endCondition === 'until' && config.endValue) {
      const endDate = new Date(config.endValue as string)
      if (currentDate > endDate) {
        break
      }
    }
  }
  
  return dates
}




