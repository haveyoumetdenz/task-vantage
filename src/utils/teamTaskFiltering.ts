/**
 * Team task filtering utilities
 * Tests: TM-COR-04
 */

import { Task } from '@/hooks/useFirebaseTasks'

export interface TeamTaskFilterResult {
  myTasks: Task[]
  teamTasks: Task[]
}

/**
 * Filters tasks into "My Tasks" and "Team Tasks"
 * - My Tasks: Tasks where user is an assignee
 * - Team Tasks: Tasks assigned to team members (excluding user's own tasks)
 */
export function filterTasksByTeam(
  tasks: Task[],
  userId: string,
  teamMemberIds: string[]
): TeamTaskFilterResult {
  const myTasks = tasks.filter(task => {
    const assigneeIds = task.assigneeIds || []
    return assigneeIds.includes(userId)
  })

  const teamTasks = tasks.filter(task => {
    const assigneeIds = task.assigneeIds || []
    // Task is assigned to a team member
    const isAssignedToTeamMember = assigneeIds.some(id => teamMemberIds.includes(id))
    // Task is NOT assigned to the current user (to avoid double counting)
    const isNotMyTask = !assigneeIds.includes(userId)
    
    return isAssignedToTeamMember && isNotMyTask
  })

  return {
    myTasks,
    teamTasks
  }
}

/**
 * Filters tasks to include/exclude user's own tasks in team view
 */
export function getTeamTasksWithOption(
  teamTasks: Task[],
  myTasks: Task[],
  includeMyTasks: boolean
): Task[] {
  if (includeMyTasks) {
    // Merge team tasks and my tasks, avoiding duplicates
    const myTaskIds = new Set(myTasks.map(t => t.id))
    const uniqueTeamTasks = teamTasks.filter(t => !myTaskIds.has(t.id))
    return [...uniqueTeamTasks, ...myTasks]
  }
  
  return teamTasks
}

/**
 * Checks if a task is overdue based on due date and status
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
    return false
  }
  
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  
  return dueDate < now
}

/**
 * Filters tasks by overdue status
 */
export function filterOverdueTasks(tasks: Task[]): Task[] {
  return tasks.filter(isTaskOverdue)
}

/**
 * Gets task statistics for team dashboard
 */
export function getTeamTaskStats(tasks: Task[]): {
  total: number
  completed: number
  inProgress: number
  todo: number
  overdue: number
} {
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: filterOverdueTasks(tasks).length
  }
}

