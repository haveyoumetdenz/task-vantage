/**
 * Report generation utilities
 * Tests: RGE-COR-02
 */

import { Task } from '@/hooks/useFirebaseTasks'

export interface TaskSummaryReport {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime?: number // in days
}

export interface TeamPerformanceReport {
  teamId: string
  teamName: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime?: number
  memberContributions: {
    userId: string
    userName: string
    tasksAssigned: number
    tasksCompleted: number
    completionRate: number
  }[]
}

/**
 * Calculates task completion rate
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Calculates average completion time for completed tasks
 */
export function calculateAverageCompletionTime(tasks: Task[]): number | undefined {
  const completedTasks = tasks.filter(t => 
    t.status === 'completed' && 
    t.createdAt && 
    t.completedAt
  )
  
  if (completedTasks.length === 0) return undefined
  
  const totalDays = completedTasks.reduce((sum, task) => {
    const created = new Date(task.createdAt)
    const completed = new Date(task.completedAt!)
    const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return sum + days
  }, 0)
  
  return Math.round((totalDays / completedTasks.length) * 100) / 100
}

/**
 * Generates personal task summary report
 */
export function generateTaskSummaryReport(tasks: Task[]): TaskSummaryReport {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  
  const now = new Date()
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false
    }
    return new Date(task.dueDate) < now
  }).length
  
  const completionRate = calculateCompletionRate(completedTasks, totalTasks)
  const averageCompletionTime = calculateAverageCompletionTime(tasks)
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    averageCompletionTime
  }
}

/**
 * Generates team performance report
 */
export function generateTeamPerformanceReport(
  tasks: Task[],
  teamId: string,
  teamName: string,
  memberMap: Map<string, { id: string; name: string }>
): TeamPerformanceReport {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  
  const now = new Date()
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false
    }
    return new Date(task.dueDate) < now
  }).length
  
  const completionRate = calculateCompletionRate(completedTasks, totalTasks)
  const averageCompletionTime = calculateAverageCompletionTime(tasks)
  
  // Calculate member contributions
  const memberContributions = Array.from(memberMap.entries()).map(([userId, member]) => {
    const memberTasks = tasks.filter(t => t.assigneeIds?.includes(userId))
    const memberCompleted = memberTasks.filter(t => t.status === 'completed').length
    
    return {
      userId,
      userName: member.name,
      tasksAssigned: memberTasks.length,
      tasksCompleted: memberCompleted,
      completionRate: calculateCompletionRate(memberCompleted, memberTasks.length)
    }
  })
  
  return {
    teamId,
    teamName,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    averageCompletionTime,
    memberContributions
  }
}

/**
 * Formats report data for PDF export
 */
export function formatReportForPDF(report: TaskSummaryReport | TeamPerformanceReport): string {
  if ('memberContributions' in report) {
    // Team performance report
    const teamReport = report as TeamPerformanceReport
    return `
Team Performance Report: ${teamReport.teamName}
Total Tasks: ${teamReport.totalTasks}
Completed: ${teamReport.completedTasks}
In Progress: ${teamReport.inProgressTasks}
Overdue: ${teamReport.overdueTasks}
Completion Rate: ${teamReport.completionRate}%
Average Completion Time: ${teamReport.averageCompletionTime ? `${teamReport.averageCompletionTime} days` : 'N/A'}

Member Contributions:
${teamReport.memberContributions.map(m => 
  `- ${m.userName}: ${m.tasksCompleted}/${m.tasksAssigned} (${m.completionRate}%)`
).join('\n')}
    `.trim()
  } else {
    // Personal task summary report
    const summaryReport = report as TaskSummaryReport
    return `
Task Summary Report
Total Tasks: ${summaryReport.totalTasks}
Completed: ${summaryReport.completedTasks}
In Progress: ${summaryReport.inProgressTasks}
Overdue: ${summaryReport.overdueTasks}
Completion Rate: ${summaryReport.completionRate}%
Average Completion Time: ${summaryReport.averageCompletionTime ? `${summaryReport.averageCompletionTime} days` : 'N/A'}
    `.trim()
  }
}

