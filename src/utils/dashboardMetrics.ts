/**
 * Dashboard metrics calculation utilities
 * Tests: TM-COR-02, TGO-COR-02
 */

import { Task } from '@/hooks/useFirebaseTasks'
import { Project } from '@/hooks/useFirebaseProjects'

export interface TaskMetrics {
  total: number
  completed: number
  inProgress: number
  todo: number
  overdue: number
}

export interface ProjectMetrics {
  total: number
  active: number
  completed: number
  dueThisWeek: number
}

/**
 * Calculates task metrics from task array
 */
export function calculateTaskMetrics(tasks: Task[]): TaskMetrics {
  const now = new Date()
  
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo = tasks.filter(t => t.status === 'todo').length
  
  const overdue = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') {
      return false
    }
    const due = new Date(task.due_date)
    return due < now
  }).length
  
  return {
    total,
    completed,
    inProgress,
    todo,
    overdue
  }
}

/**
 * Calculates project metrics from project array
 */
export function calculateProjectMetrics(projects: Project[]): ProjectMetrics {
  const now = new Date()
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const total = projects.length
  const active = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  
  const dueThisWeek = projects.filter(project => {
    if (!project.due_date || project.status === 'completed' || project.status === 'cancelled') {
      return false
    }
    const due = new Date(project.due_date)
    return due >= now && due <= oneWeekFromNow
  }).length
  
  return {
    total,
    active,
    completed,
    dueThisWeek
  }
}

/**
 * Filters tasks by status
 */
export function filterTasksByStatus(tasks: Task[], status: 'all' | 'todo' | 'in_progress' | 'completed' | 'cancelled'): Task[] {
  if (status === 'all') {
    return tasks
  }
  
  return tasks.filter(task => task.status === status)
}

/**
 * Filters tasks by priority range
 */
export function filterTasksByPriority(
  tasks: Task[],
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
): Task[] {
  if (priority === 'all') {
    return tasks
  }
  
  const priorityRanges = {
    low: [1, 2, 3],
    medium: [4, 5, 6],
    high: [7, 8],
    urgent: [9, 10]
  }
  
  const range = priorityRanges[priority]
  
  return tasks.filter(task => {
    const taskPriority = task.priority || 5
    return range.includes(taskPriority)
  })
}

/**
 * Searches tasks by title or description
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query || query.trim().length === 0) {
    return tasks
  }
  
  const lowerQuery = query.toLowerCase()
  
  return tasks.filter(task => {
    const titleMatch = task.title?.toLowerCase().includes(lowerQuery) || false
    const descriptionMatch = task.description?.toLowerCase().includes(lowerQuery) || false
    
    return titleMatch || descriptionMatch
  })
}

