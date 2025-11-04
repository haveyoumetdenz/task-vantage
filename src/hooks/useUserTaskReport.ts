import { useState, useEffect } from 'react'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'

export interface UserTaskReportData {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageTaskTime: number
  tasksByStatus: {
    todo: number
    in_progress: number
    completed: number
    cancelled: number
  }
  recentTasks: Array<{
    id: string
    title: string
    status: string
    dueDate?: string
    completedAt?: string
  }>
}

export const useUserTaskReport = () => {
  const [reportData, setReportData] = useState<UserTaskReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { tasks } = useFirebaseTasks()
  const { profile } = useFirebaseProfile()

  useEffect(() => {
    const generateReport = () => {
      try {
        setLoading(true)
        setError(null)

        console.log('User Task Report - Tasks:', tasks?.length, tasks)
        console.log('User Task Report - Profile:', profile)

        if (!tasks || !profile) {
          console.log('User Task Report - Missing data:', { tasks: !!tasks, profile: !!profile })
          setLoading(false)
          return
        }

        // Filter tasks for the current user only
        const userTasks = tasks.filter(task => 
          task.userId === profile.userId || 
          task.assigneeIds?.includes(profile.userId)
        )

        console.log('User Task Report - User tasks:', userTasks.length, userTasks)

        if (userTasks.length === 0) {
          setReportData({
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
            averageTaskTime: 0,
            tasksByStatus: {
              todo: 0,
              in_progress: 0,
              completed: 0,
              cancelled: 0
            },
            recentTasks: []
          })
          setLoading(false)
          return
        }

        // Calculate task statistics
        const completedTasks = userTasks.filter(task => task.status === 'completed')
        const inProgressTasks = userTasks.filter(task => task.status === 'in_progress')
        const overdueTasks = userTasks.filter(task => {
          if (task.status === 'completed' || !task.dueDate) return false
          return new Date(task.dueDate) < new Date()
        })

        const completionRate = userTasks.length > 0 
          ? Math.round((completedTasks.length / userTasks.length) * 100)
          : 0

        // Calculate average completion time for completed tasks
        let averageTaskTime = 0
        if (completedTasks.length > 0) {
          const totalTime = completedTasks.reduce((sum, task) => {
            if (task.dueDate && task.createdAt) {
              const created = new Date(task.createdAt)
              const due = new Date(task.dueDate)
              return sum + Math.abs(due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            }
            return sum
          }, 0)
          averageTaskTime = Math.round(totalTime / completedTasks.length)
        }

        // Group tasks by status
        const tasksByStatus = {
          todo: userTasks.filter(task => task.status === 'todo').length,
          in_progress: userTasks.filter(task => task.status === 'in_progress').length,
          completed: userTasks.filter(task => task.status === 'completed').length,
          cancelled: userTasks.filter(task => task.status === 'cancelled').length
        }

        // Get recent tasks (last 10)
        const recentTasks = userTasks
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            dueDate: task.dueDate,
            completedAt: task.completedAt
          }))

        setReportData({
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          inProgressTasks: inProgressTasks.length,
          overdueTasks: overdueTasks.length,
          completionRate,
          averageTaskTime,
          tasksByStatus,
          recentTasks
        })
      } catch (err) {
        console.error('Error generating user task report:', err)
        setError('Failed to generate user task report')
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [tasks, profile])

  return {
    reportData,
    loading,
    error
  }
}




