/**
 * Calendar calculation utilities
 * Tests: DST-COR-03
 */

import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns'
import { Task } from '@/hooks/useFirebaseTasks'

export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarDay {
  date: Date
  tasks: Task[]
}

export interface CalendarWeek {
  startDate: Date
  endDate: Date
  days: CalendarDay[]
}

export interface CalendarMonth {
  startDate: Date
  endDate: Date
  weeks: CalendarWeek[]
}

/**
 * Filters tasks by due date (only tasks with due dates appear in calendar)
 */
export function filterTasksWithDueDates(tasks: Task[]): Task[] {
  return tasks.filter(task => task.dueDate && task.dueDate.trim().length > 0)
}

/**
 * Gets tasks for a specific day
 */
export function getTasksForDay(tasks: Task[], date: Date): Task[] {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  
  return filterTasksWithDueDates(tasks).filter(task => {
    if (!task.dueDate) return false
    
    const taskDueDate = new Date(task.dueDate)
    return isWithinInterval(taskDueDate, { start: dayStart, end: dayEnd })
  })
}

/**
 * Gets tasks for a specific week
 */
export function getTasksForWeek(tasks: Task[], weekStart: Date): CalendarWeek {
  const weekEnd = endOfWeek(weekStart)
  const weekStartOnly = startOfWeek(weekStart)
  
  const days = eachDayOfInterval({ start: weekStartOnly, end: weekEnd })
  
  const daysWithTasks: CalendarDay[] = days.map(day => ({
    date: day,
    tasks: getTasksForDay(tasks, day)
  }))
  
  return {
    startDate: weekStartOnly,
    endDate: weekEnd,
    days: daysWithTasks
  }
}

/**
 * Gets tasks for a specific month
 */
export function getTasksForMonth(tasks: Task[], monthStart: Date): CalendarMonth {
  const monthStartOnly = startOfMonth(monthStart)
  const monthEndOnly = endOfMonth(monthStart)
  
  const allDays = eachDayOfInterval({ start: monthStartOnly, end: monthEndOnly })
  
  // Group days into weeks
  const weeks: CalendarWeek[] = []
  let currentWeek: CalendarDay[] = []
  
  allDays.forEach((day, index) => {
    const dayTasks = getTasksForDay(tasks, day)
    currentWeek.push({
      date: day,
      tasks: dayTasks
    })
    
    // Start new week on Sunday or at end of month
    const isSunday = day.getDay() === 0
    const isLastDay = index === allDays.length - 1
    
    if (isSunday || isLastDay) {
      weeks.push({
        startDate: currentWeek[0].date,
        endDate: currentWeek[currentWeek.length - 1].date,
        days: [...currentWeek]
      })
      currentWeek = []
    }
  })
  
  return {
    startDate: monthStartOnly,
    endDate: monthEndOnly,
    weeks
  }
}

/**
 * Formats date for calendar display
 */
export function formatCalendarDate(date: Date, mode: CalendarViewMode): string {
  switch (mode) {
    case 'day':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'week':
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    case 'month':
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    default:
      return date.toLocaleDateString()
  }
}

/**
 * Gets calendar view data based on mode
 */
export function getCalendarViewData(
  tasks: Task[],
  viewDate: Date,
  mode: CalendarViewMode
): CalendarDay | CalendarWeek | CalendarMonth {
  switch (mode) {
    case 'day':
      return {
        date: viewDate,
        tasks: getTasksForDay(tasks, viewDate)
      }
    case 'week':
      return getTasksForWeek(tasks, viewDate)
    case 'month':
      return getTasksForMonth(tasks, viewDate)
    default:
      return {
        date: viewDate,
        tasks: getTasksForDay(tasks, viewDate)
      }
  }
}

