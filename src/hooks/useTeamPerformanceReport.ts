import { useState, useEffect } from 'react'
import { useFirebaseTeamMembers } from '@/hooks/useFirebaseTeamMembers'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'

export interface TeamMemberPerformance {
  id: string
  name: string
  role: string
  tasksCompleted: number
  completionRate: number
  averageTime: number
  overdueTasks: number
}

export interface TeamPerformanceReportData {
  totalMembers: number
  overallCompletionRate: number
  averageTaskTime: number
  members: TeamMemberPerformance[]
}

export const useTeamPerformanceReport = () => {
  const [reportData, setReportData] = useState<TeamPerformanceReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { teamMembers: members } = useFirebaseTeamMembers()
  const { tasks } = useFirebaseTasks()
  const { profile } = useFirebaseProfile()

  useEffect(() => {
    const generateReport = () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Team Performance Report - Members:', members?.length, members)
        console.log('Team Performance Report - Tasks:', tasks?.length, tasks)

        if (!members || !tasks) {
          console.log('Team Performance Report - Missing data:', { members: !!members, tasks: !!tasks })
          setLoading(false)
          return
        }

        // Filter team members to only include those in the current manager's team
        const teamMembers = members.filter(member => member.teamId === profile?.teamId)
        console.log('Team Performance Report - Team members in manager\'s team:', teamMembers.length, teamMembers)
        console.log('Team Performance Report - Manager teamId:', profile?.teamId)

        if (teamMembers.length === 0) {
          console.log('Team Performance Report - No team members found')
          setLoading(false)
          return
        }

        // Calculate performance for each team member
        const memberPerformance: TeamMemberPerformance[] = teamMembers.map(member => {
          const memberTasks = tasks.filter(task => 
            task.assigneeIds?.includes(member.id) || task.userId === member.id
          )

          const completedTasks = memberTasks.filter(task => task.status === 'completed')
          const overdueTasks = memberTasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false
            return new Date(task.dueDate) < new Date()
          })

          const completionRate = memberTasks.length > 0 
            ? Math.round((completedTasks.length / memberTasks.length) * 100)
            : 0

          // Calculate average completion time for completed tasks
          let averageTime = 0
          if (completedTasks.length > 0) {
            const totalTime = completedTasks.reduce((sum, task) => {
              if (task.dueDate && task.createdAt) {
                const created = new Date(task.createdAt)
                const due = new Date(task.dueDate)
                return sum + Math.abs(due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              }
              return sum
            }, 0)
            averageTime = Math.round(totalTime / completedTasks.length)
          }

          return {
            id: member.id,
            name: member.displayName || member.email,
            role: member.role || 'Staff',
            tasksCompleted: completedTasks.length,
            completionRate,
            averageTime,
            overdueTasks: overdueTasks.length
          }
        })

        // Calculate overall statistics
        const totalMembers = memberPerformance.length
        const overallCompletionRate = totalMembers > 0
          ? Math.round(memberPerformance.reduce((sum, member) => sum + member.completionRate, 0) / totalMembers)
          : 0

        const averageTaskTime = totalMembers > 0
          ? Math.round(memberPerformance.reduce((sum, member) => sum + member.averageTime, 0) / totalMembers)
          : 0

        setReportData({
          totalMembers,
          overallCompletionRate,
          averageTaskTime,
          members: memberPerformance
        })
      } catch (err) {
        console.error('Error generating team performance report:', err)
        setError('Failed to generate team performance report')
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [members, tasks, profile])

  return {
    reportData,
    loading,
    error
  }
}
