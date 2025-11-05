import { describe, it, expect } from 'vitest'
import {
  filterTasksWithDueDates,
  getTasksForDay,
  getTasksForWeek,
  getTasksForMonth,
  formatCalendarDate,
  getCalendarViewData
} from '@/utils/calendarCalculations'
import { Task } from '@/hooks/useFirebaseTasks'
import { startOfDay, addDays } from 'date-fns'

describe('Calendar Calculations - DST-COR-03', () => {
  const createTestTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task',
    status: 'todo',
    priority: 5,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })

  describe('filterTasksWithDueDates', () => {
    it('should filter tasks with due dates', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: '2025-12-31' }),
        createTestTask({ id: '2', dueDate: undefined }),
        createTestTask({ id: '3', dueDate: '2025-12-25' })
      ]
      
      const filtered = filterTasksWithDueDates(tasks)
      
      expect(filtered.length).toBe(2)
      expect(filtered.map(t => t.id)).toEqual(['1', '3'])
    })

    it('should exclude tasks with empty due dates', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: '' })
      ]
      
      const filtered = filterTasksWithDueDates(tasks)
      
      expect(filtered.length).toBe(0)
    })
  })

  describe('getTasksForDay', () => {
    it('should return tasks for specific day', () => {
      const targetDate = new Date('2025-12-31')
      const dayStart = startOfDay(targetDate)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: dayStart.toISOString() }),
        createTestTask({ id: '2', dueDate: addDays(dayStart, 1).toISOString() }),
        createTestTask({ id: '3', dueDate: undefined })
      ]
      
      const dayTasks = getTasksForDay(tasks, targetDate)
      
      expect(dayTasks.length).toBe(1)
      expect(dayTasks[0].id).toBe('1')
    })
  })

  describe('getTasksForWeek', () => {
    it('should return tasks organized by week days', () => {
      const weekStart = new Date('2025-12-29') // Monday
      const targetDay = addDays(weekStart, 2) // Wednesday
      
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: targetDay.toISOString() })
      ]
      
      const week = getTasksForWeek(tasks, weekStart)
      
      expect(week.days.length).toBe(7)
      expect(week.startDate).toBeDefined()
      expect(week.endDate).toBeDefined()
      
      // Find Wednesday in the week
      const wednesday = week.days.find(d => 
        d.date.toDateString() === targetDay.toDateString()
      )
      expect(wednesday).toBeDefined()
      expect(wednesday?.tasks.length).toBe(1)
    })
  })

  describe('getTasksForMonth', () => {
    it('should return tasks organized by month weeks', () => {
      const monthStart = new Date('2025-12-01')
      const targetDay = new Date('2025-12-15')
      
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: targetDay.toISOString() })
      ]
      
      const month = getTasksForMonth(tasks, monthStart)
      
      expect(month.weeks.length).toBeGreaterThan(0)
      expect(month.startDate).toBeDefined()
      expect(month.endDate).toBeDefined()
      
      // Find task in one of the weeks
      const hasTask = month.weeks.some(week =>
        week.days.some(day => day.tasks.some(t => t.id === '1'))
      )
      expect(hasTask).toBe(true)
    })
  })

  describe('formatCalendarDate', () => {
    it('should format date for day view', () => {
      const date = new Date('2025-12-31')
      const formatted = formatCalendarDate(date, 'day')
      
      expect(formatted).toContain('December')
      expect(formatted).toContain('31')
      expect(formatted).toContain('2025')
    })

    it('should format date for month view', () => {
      const date = new Date('2025-12-31')
      const formatted = formatCalendarDate(date, 'month')
      
      expect(formatted).toContain('December')
      expect(formatted).toContain('2025')
    })
  })

  describe('getCalendarViewData', () => {
    it('should return day view data', () => {
      const date = new Date('2025-12-31')
      const tasks: Task[] = [
        createTestTask({ id: '1', dueDate: date.toISOString() })
      ]
      
      const viewData = getCalendarViewData(tasks, date, 'day')
      
      expect('date' in viewData).toBe(true)
      expect('tasks' in viewData).toBe(true)
      if ('tasks' in viewData) {
        expect(viewData.tasks.length).toBe(1)
      }
    })

    it('should return week view data', () => {
      const date = new Date('2025-12-29')
      const tasks: Task[] = []
      
      const viewData = getCalendarViewData(tasks, date, 'week')
      
      expect('days' in viewData).toBe(true)
      if ('days' in viewData) {
        expect(viewData.days.length).toBe(7)
      }
    })

    it('should return month view data', () => {
      const date = new Date('2025-12-01')
      const tasks: Task[] = []
      
      const viewData = getCalendarViewData(tasks, date, 'month')
      
      expect('weeks' in viewData).toBe(true)
    })
  })
})

