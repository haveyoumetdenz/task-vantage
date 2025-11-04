export type ProjectStatus = 'active' | 'completed' | 'cancelled'

export interface Task {
  id: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: number
  createdAt: string
  updatedAt: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates project title
 * @param title - The project title to validate
 * @returns Validation result with error message if invalid
 */
export function validateProjectTitle(title: string): { valid: boolean; error?: string } {
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' }
  }
  
  if (title.trim().length === 0) {
    return { valid: false, error: 'Title is required and cannot be empty' }
  }
  
  if (title.length > 200) {
    return { valid: false, error: 'Title cannot exceed 200 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates project status
 * @param status - The status string to validate
 * @returns True if status is valid
 */
export function validateProjectStatus(status: string): status is ProjectStatus {
  return ['active', 'completed', 'cancelled'].includes(status)
}

/**
 * Validates project progress percentage
 * @param progress - The progress value to validate
 * @returns Validation result with error message if invalid
 */
export function validateProjectProgress(progress: number): { valid: boolean; error?: string } {
  if (typeof progress !== 'number' || isNaN(progress)) {
    return { valid: false, error: 'Progress must be a number' }
  }
  
  if (progress < 0) {
    return { valid: false, error: 'Progress cannot be negative' }
  }
  
  if (progress > 100) {
    return { valid: false, error: 'Progress cannot exceed 100%' }
  }
  
  return { valid: true }
}

/**
 * Calculates project progress based on task completion
 * @param tasks - Array of tasks in the project
 * @returns Calculated progress percentage (0-100)
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0
  }
  
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const progress = (completedTasks.length / tasks.length) * 100
  
  return Math.round(progress * 100) / 100 // Round to 2 decimal places
}

/**
 * Determines project status based on task completion
 * @param tasks - Array of tasks in the project
 * @param currentStatus - Current project status
 * @returns Recommended project status
 */
export function determineProjectStatus(tasks: Task[], currentStatus?: ProjectStatus): ProjectStatus {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 'active' // Empty projects are active by default
  }
  
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const cancelledTasks = tasks.filter(task => task.status === 'cancelled')
  const totalTasks = tasks.length
  
  // If project was cancelled, keep it cancelled unless explicitly changed
  if (currentStatus === 'cancelled') {
    return 'cancelled'
  }
  
  // If all tasks are completed, project is completed
  if (completedTasks.length === totalTasks) {
    return 'completed'
  }
  
  // If all tasks are cancelled, project is cancelled
  if (cancelledTasks.length === totalTasks) {
    return 'cancelled'
  }
  
  // Default to active for projects with mixed or incomplete tasks
  return 'active'
}

/**
 * Validates project description
 * @param description - The description to validate
 * @returns Validation result with error message if invalid
 */
export function validateProjectDescription(description?: string): { valid: boolean; error?: string } {
  if (description === undefined || description === null) {
    return { valid: true } // Description is optional
  }
  
  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' }
  }
  
  if (description.length > 1000) {
    return { valid: false, error: 'Description cannot exceed 1000 characters' }
  }
  
  return { valid: true }
}

/**
 * Validates project dates
 * @param startDate - The start date string
 * @param endDate - The end date string
 * @returns Validation result with error message if invalid
 */
export function validateProjectDates(
  startDate?: string, 
  endDate?: string
): { valid: boolean; error?: string } {
  // Start date validation
  if (startDate !== undefined && startDate !== null && startDate !== '') {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      return { valid: false, error: 'Start date must be a valid date' }
    }
  }
  
  // End date validation
  if (endDate !== undefined && endDate !== null && endDate !== '') {
    const end = new Date(endDate)
    if (isNaN(end.getTime())) {
      return { valid: false, error: 'End date must be a valid date' }
    }
    
    // If both dates exist, end date should be after start date
    if (startDate && startDate !== '') {
      const start = new Date(startDate)
      if (end <= start) {
        return { valid: false, error: 'End date must be after start date' }
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validates team members array
 * @param teamMembers - Array of team member IDs
 * @returns Validation result with error message if invalid
 */
export function validateTeamMembers(teamMembers?: string[]): { valid: boolean; error?: string } {
  if (teamMembers === undefined || teamMembers === null) {
    return { valid: true } // Team members are optional
  }
  
  if (!Array.isArray(teamMembers)) {
    return { valid: false, error: 'Team members must be an array' }
  }
  
  for (const memberId of teamMembers) {
    if (typeof memberId !== 'string' || memberId.trim().length === 0) {
      return { valid: false, error: 'All team member IDs must be non-empty strings' }
    }
  }
  
  return { valid: true }
}

/**
 * Gets project statistics
 * @param tasks - Array of tasks in the project
 * @returns Project statistics object
 */
export function getProjectStatistics(tasks: Task[]) {
  if (!Array.isArray(tasks)) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      cancelledTasks: 0,
      progress: 0,
      averagePriority: 0
    }
  }
  
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
  const todoTasks = tasks.filter(task => task.status === 'todo').length
  const cancelledTasks = tasks.filter(task => task.status === 'cancelled').length
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const averagePriority = totalTasks > 0 
    ? tasks.reduce((sum, task) => sum + task.priority, 0) / totalTasks 
    : 0
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    cancelledTasks,
    progress: Math.round(progress * 100) / 100,
    averagePriority: Math.round(averagePriority * 100) / 100
  }
}

/**
 * Validates complete project data
 * @param data - The project data to validate
 * @returns Complete validation result with all errors
 */
export function validateProjectData(data: {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  teamMembers?: string[]
}): ValidationResult {
  const errors: string[] = []
  
  // Validate title (required)
  const titleValidation = validateProjectTitle(data.title)
  if (!titleValidation.valid) {
    errors.push(titleValidation.error!)
  }
  
  // Validate description (optional)
  const descriptionValidation = validateProjectDescription(data.description)
  if (!descriptionValidation.valid) {
    errors.push(descriptionValidation.error!)
  }
  
  // Validate dates
  const datesValidation = validateProjectDates(data.startDate, data.endDate)
  if (!datesValidation.valid) {
    errors.push(datesValidation.error!)
  }
  
  // Validate team members (optional)
  const teamValidation = validateTeamMembers(data.teamMembers)
  if (!teamValidation.valid) {
    errors.push(teamValidation.error!)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
