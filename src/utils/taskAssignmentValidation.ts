/**
 * Task assignment validation utilities
 * Tests: TM-COR-06
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates if a user can assign tasks to specific assignees
 * Only managers can assign/reassign tasks
 */
export function canAssignTasks(userRole: string): boolean {
  const allowedRoles = ['Manager', 'Director', 'Senior Management', 'HR']
  return allowedRoles.includes(userRole)
}

/**
 * Validates assignee IDs for task assignment
 */
export function validateAssigneeIds(assigneeIds: string[]): ValidationResult {
  const errors: string[] = []
  
  if (!Array.isArray(assigneeIds)) {
    errors.push('Assignee IDs must be an array')
    return { valid: false, errors }
  }
  
  if (assigneeIds.length === 0) {
    errors.push('At least one assignee is required')
    return { valid: false, errors }
  }
  
  // Check for duplicate IDs
  const uniqueIds = new Set(assigneeIds)
  if (uniqueIds.size !== assigneeIds.length) {
    errors.push('Duplicate assignee IDs are not allowed')
  }
  
  // Validate each ID is a non-empty string
  assigneeIds.forEach((id, index) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      errors.push(`Assignee ID at index ${index} is invalid`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates if assignees are within user's managed scope
 * - Manager: Can assign to their team only
 * - Director: Can assign to their team + descendants
 * - Senior Management: Can assign to any team
 */
export function validateAssigneeScope(
  assigneeIds: string[],
  userRole: string,
  managedTeamIds: string[],
  assigneeTeamMap: Map<string, string[]> // Map assigneeId -> teamIds
): ValidationResult {
  const errors: string[] = []
  
  if (!canAssignTasks(userRole)) {
    errors.push(`User role "${userRole}" cannot assign tasks. Only managers can assign tasks.`)
    return { valid: false, errors }
  }
  
  // Senior Management can assign to anyone
  if (userRole === 'Senior Management') {
    return { valid: true, errors: [] }
  }
  
  // Director can assign to their team + descendants
  if (userRole === 'Director') {
    // For now, assume director can assign to their team + descendants
    // This would need actual team hierarchy check in production
    return { valid: true, errors: [] }
  }
  
  // Manager can only assign to their team
  assigneeIds.forEach(assigneeId => {
    const assigneeTeams = assigneeTeamMap.get(assigneeId) || []
    const isInManagedTeam = assigneeTeams.some(teamId => managedTeamIds.includes(teamId))
    
    if (!isInManagedTeam) {
      errors.push(`Assignee ${assigneeId} is not in your managed teams`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates complete task assignment data
 */
export function validateTaskAssignment(data: {
  assigneeIds: string[]
  userRole: string
  managedTeamIds?: string[]
  assigneeTeamMap?: Map<string, string[]>
}): ValidationResult {
  const errors: string[] = []
  
  // Validate assignee IDs format
  const assigneeValidation = validateAssigneeIds(data.assigneeIds)
  if (!assigneeValidation.valid) {
    errors.push(...assigneeValidation.errors)
  }
  
  // Validate user can assign tasks
  if (!canAssignTasks(data.userRole)) {
    errors.push(`User role "${data.userRole}" cannot assign tasks`)
  }
  
  // Validate scope if team info provided
  if (data.managedTeamIds && data.assigneeTeamMap) {
    const scopeValidation = validateAssigneeScope(
      data.assigneeIds,
      data.userRole,
      data.managedTeamIds,
      data.assigneeTeamMap
    )
    if (!scopeValidation.valid) {
      errors.push(...scopeValidation.errors)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

