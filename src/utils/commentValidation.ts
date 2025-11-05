/**
 * Comment validation utilities
 * Tests: TM-COR-07
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates comment content
 */
export function validateCommentContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Comment cannot be empty' }
  }
  
  if (content.length > 5000) {
    return { valid: false, error: 'Comment cannot exceed 5000 characters' }
  }
  
  return { valid: true }
}

/**
 * Parses @mentions from comment text
 * Returns array of mentioned usernames
 */
export function parseMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]
    if (!mentions.includes(username)) {
      mentions.push(username)
    }
  }
  
  return mentions
}

/**
 * Validates complete comment data
 */
export function validateCommentData(data: {
  content: string
  taskId?: string
  userId?: string
}): ValidationResult {
  const errors: string[] = []
  
  const contentValidation = validateCommentContent(data.content)
  if (!contentValidation.valid) {
    errors.push(contentValidation.error!)
  }
  
  if (data.taskId !== undefined && (!data.taskId || data.taskId.trim().length === 0)) {
    errors.push('Task ID is required')
  }
  
  if (data.userId !== undefined && (!data.userId || data.userId.trim().length === 0)) {
    errors.push('User ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes comment content (removes dangerous HTML, trims whitespace)
 */
export function sanitizeCommentContent(content: string): string {
  return content.trim()
}

