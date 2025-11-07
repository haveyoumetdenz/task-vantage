import * as z from 'zod'

/**
 * Password validation schema that enforces:
 * - Minimum 8 characters
 * - At least one letter
 * - At least one number
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine((password) => /[a-zA-Z]/.test(password), {
    message: 'Password must contain at least one letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })

