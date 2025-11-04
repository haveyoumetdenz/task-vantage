import { describe, it, expect } from 'vitest'
import {
  validateRecurrenceFrequency,
  validateRecurrenceInterval,
  validateRecurrenceEndCondition,
  validateRecurrenceStartDate,
  validateRecurrenceEndValue,
  calculateRecurringInstances,
  validateRecurrenceConfig,
  generateRecurringDates,
  type RecurrenceConfig
} from '@/utils/recurrenceValidation'

describe('Recurrence Validation - TM-COR-05 (Recurring Tasks)', () => {
  describe('validateRecurrenceFrequency', () => {
    it('should accept valid frequencies', () => {
      expect(validateRecurrenceFrequency('daily')).toBe(true)
      expect(validateRecurrenceFrequency('weekly')).toBe(true)
      expect(validateRecurrenceFrequency('monthly')).toBe(true)
      expect(validateRecurrenceFrequency('yearly')).toBe(true)
    })

    it('should reject invalid frequencies', () => {
      expect(validateRecurrenceFrequency('invalid')).toBe(false)
      expect(validateRecurrenceFrequency('hourly')).toBe(false)
      expect(validateRecurrenceFrequency('')).toBe(false)
      expect(validateRecurrenceFrequency('biweekly')).toBe(false)
    })
  })

  describe('validateRecurrenceInterval', () => {
    it('should reject non-number interval', () => {
      const result = validateRecurrenceInterval('invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Interval must be a number')
    })

    it('should reject NaN interval', () => {
      const result = validateRecurrenceInterval(NaN)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Interval must be a number')
    })

    it('should reject non-integer interval', () => {
      const result = validateRecurrenceInterval(1.5)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Interval must be an integer')
    })

    it('should reject interval below 1', () => {
      const result = validateRecurrenceInterval(0)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Interval must be at least 1')
    })

    it('should reject interval above 365', () => {
      const result = validateRecurrenceInterval(366)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Interval cannot exceed 365')
    })

    it('should accept valid intervals', () => {
      for (let interval = 1; interval <= 365; interval++) {
        const result = validateRecurrenceInterval(interval)
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('validateRecurrenceEndCondition', () => {
    it('should accept valid end conditions', () => {
      expect(validateRecurrenceEndCondition('never')).toBe(true)
      expect(validateRecurrenceEndCondition('after')).toBe(true)
      expect(validateRecurrenceEndCondition('until')).toBe(true)
    })

    it('should reject invalid end conditions', () => {
      expect(validateRecurrenceEndCondition('invalid')).toBe(false)
      expect(validateRecurrenceEndCondition('')).toBe(false)
      expect(validateRecurrenceEndCondition('forever')).toBe(false)
    })
  })

  describe('validateRecurrenceStartDate', () => {
    it('should reject empty start date', () => {
      const result = validateRecurrenceStartDate('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Start date is required')
    })

    it('should reject invalid date string', () => {
      const result = validateRecurrenceStartDate('invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Start date must be a valid date')
    })

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      const result = validateRecurrenceStartDate(pastDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Start date cannot be in the past')
    })

    it('should accept future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      const result = validateRecurrenceStartDate(futureDate)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateRecurrenceEndValue', () => {
    it('should accept undefined end value for never condition', () => {
      const result = validateRecurrenceEndValue('never', undefined)
      expect(result.valid).toBe(true)
    })

    it('should require end value for after condition', () => {
      const result = validateRecurrenceEndValue('after', undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End value is required for "after" condition')
    })

    it('should validate after condition with valid number', () => {
      const result = validateRecurrenceEndValue('after', 10)
      expect(result.valid).toBe(true)
    })

    it('should reject after condition with invalid number', () => {
      const result = validateRecurrenceEndValue('after', 0)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End value must be a positive integer for "after" condition')
    })

    it('should reject after condition with non-number', () => {
      const result = validateRecurrenceEndValue('after', 'invalid' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End value must be a number for "after" condition')
    })

    it('should require end value for until condition', () => {
      const result = validateRecurrenceEndValue('until', undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End value is required for "until" condition')
    })

    it('should validate until condition with valid date', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const result = validateRecurrenceEndValue('until', futureDate)
      expect(result.valid).toBe(true)
    })

    it('should reject until condition with invalid date', () => {
      const result = validateRecurrenceEndValue('until', 'invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End value must be a valid date for "until" condition')
    })
  })

  describe('calculateRecurringInstances', () => {
    it('should return 365 for never condition', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'never',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const instances = calculateRecurringInstances(config)
      expect(instances).toBe(365)
    })

    it('should calculate instances for after condition', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'after',
        endValue: 7,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const instances = calculateRecurringInstances(config)
      expect(instances).toBe(7)
    })

    it('should calculate instances for weekly frequency', () => {
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 2,
        endCondition: 'after',
        endValue: 10,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const instances = calculateRecurringInstances(config)
      expect(instances).toBe(5) // floor(10/2)
    })

    it('should calculate instances for until condition', () => {
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'until',
        endValue: endDate.toISOString(),
        startDate: startDate.toISOString()
      }

      const instances = calculateRecurringInstances(config)
      expect(instances).toBe(7)
    })
  })

  describe('validateRecurrenceConfig', () => {
    it('should validate complete valid config', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'after',
        endValue: 7,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const result = validateRecurrenceConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should collect multiple validation errors', () => {
      const invalidConfig: RecurrenceConfig = {
        frequency: 'invalid' as any,
        interval: 0,
        endCondition: 'invalid' as any,
        startDate: 'invalid-date'
      }

      const result = validateRecurrenceConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate end date is after start date', () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const endDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000) // Before start date
      
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'until',
        endValue: endDate.toISOString(),
        startDate: startDate.toISOString()
      }

      const result = validateRecurrenceConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('End date must be after start date')
    })
  })

  describe('generateRecurringDates', () => {
    it('should generate daily recurring dates', () => {
      const startDate = new Date('2024-01-01')
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'after',
        endValue: 3,
        startDate: startDate.toISOString()
      }

      const dates = generateRecurringDates(config, 10)
      expect(dates).toHaveLength(3)
      expect(dates[0]).toBe(startDate.toISOString())
    })

    it('should respect max instances limit', () => {
      const startDate = new Date('2024-01-01')
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'after',
        endValue: 10,
        startDate: startDate.toISOString()
      }

      const dates = generateRecurringDates(config, 5) // Limit to 5 instances
      expect(dates).toHaveLength(5)
    })

    it('should generate weekly recurring dates', () => {
      const startDate = new Date('2024-01-01')
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 1,
        endCondition: 'after',
        endValue: 2,
        startDate: startDate.toISOString()
      }

      const dates = generateRecurringDates(config, 10)
      expect(dates).toHaveLength(2)
    })

    it('should stop at end date for until condition', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-05')
      
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endCondition: 'until',
        endValue: endDate.toISOString(),
        startDate: startDate.toISOString()
      }

      const dates = generateRecurringDates(config, 10)
      expect(dates.length).toBeLessThanOrEqual(5) // Should stop at end date
    })
  })
})




