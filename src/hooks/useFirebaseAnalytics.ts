import { useState, useEffect } from 'react'
import { useFirebaseTasks } from './useFirebaseTasks'
import { useFirebaseProjects } from './useFirebaseProjects'
import { useFirebaseTeamMembers } from './useFirebaseTeamMembers'

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  inReviewTasks: number
  overdueTasks: number
  completionRate: number
  avgCompletionTime: number
}

export interface ProjectAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  projectsWithOverdueTasks: number
}

export interface TeamAnalytics {
  totalTeamMembers: number
  activeMembers: number
  tasksPerMember: Record<string, number>
  completionRatePerMember: Record<string, number>
}

export interface ActivityTrend {
  date: string
  created: number
  completed: number
}

export const useFirebaseAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { tasks, loading: tasksLoading } = useFirebaseTasks()
  const { projects, loading: projectsLoading } = useFirebaseProjects()
  const { teamMembers, loading: teamMembersLoading } = useFirebaseTeamMembers()

  useEffect(() => {
    if (!tasksLoading && !projectsLoading && !teamMembersLoading) {
      setLoading(false)
    }
  }, [tasksLoading, projectsLoading, teamMembersLoading])

  // Calculate task analytics
  const taskAnalytics: TaskAnalytics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    todoTasks: tasks.filter(t => t.status === 'todo').length,
    inReviewTasks: tasks.filter(t => t.status === 'in_review').length,
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate) return false
      return new Date(t.dueDate) < new Date() && t.status !== 'completed'
    }).length,
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
    avgCompletionTime: 0 // TODO: Calculate based on completion timestamps
  }

  // Calculate project analytics
  const projectAnalytics: ProjectAnalytics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    projectsWithOverdueTasks: projects.filter(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id)
      return projectTasks.some(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < new Date() && t.status !== 'completed'
      })
    }).length
  }

  // Calculate team analytics
  const teamAnalytics: TeamAnalytics = {
    totalTeamMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    tasksPerMember: teamMembers.reduce((acc, member) => {
      const memberTasks = tasks.filter(t => t.assigneeIds?.includes(member.id))
      acc[member.full_name || member.email || 'Unknown'] = memberTasks.length
      return acc
    }, {} as Record<string, number>),
    completionRatePerMember: teamMembers.reduce((acc, member) => {
      const memberTasks = tasks.filter(t => t.assigneeIds?.includes(member.id))
      const completedTasks = memberTasks.filter(t => t.status === 'completed')
      acc[member.full_name || member.email || 'Unknown'] = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0
      return acc
    }, {} as Record<string, number>)
  }

  // Calculate activity trends (last 30 days)
  const activityTrends: ActivityTrend[] = (() => {
    const trends: ActivityTrend[] = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const createdOnDate = tasks.filter(t => {
        if (!t.createdAt) return false
        return t.createdAt.split('T')[0] === dateStr
      }).length
      
      const completedOnDate = tasks.filter(t => {
        if (!t.completedAt) return false
        return t.completedAt.split('T')[0] === dateStr
      }).length
      
      trends.push({
        date: dateStr,
        created: createdOnDate,
        completed: completedOnDate
      })
    }
    
    return trends
  })()

  return {
    taskAnalytics,
    projectAnalytics,
    teamAnalytics,
    activityTrends,
    loading,
    error
  }
}

