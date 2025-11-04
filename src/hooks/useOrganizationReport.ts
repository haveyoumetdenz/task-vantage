import { useState, useEffect } from 'react'
import { useFirebaseTeamMembers } from '@/hooks/useFirebaseTeamMembers'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'

export interface DepartmentPerformance {
  name: string
  memberCount: number
  tasksCompleted: number
  completionRate: number
  averageTime: number
  overdueTasks: number
}

export interface OrganizationReportData {
  totalEmployees: number
  totalDepartments: number
  overallCompletionRate: number
  averageTaskTime: number
  departments: DepartmentPerformance[]
}

export const useOrganizationReport = () => {
  const [reportData, setReportData] = useState<OrganizationReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { teamMembers: members } = useFirebaseTeamMembers()
  const { tasks } = useFirebaseTasks()

  useEffect(() => {
    const generateReport = () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Organization Report - Members:', members?.length, members)
        console.log('Organization Report - Tasks:', tasks?.length, tasks)

        if (!members || !tasks) {
          console.log('Organization Report - Missing data:', { members: !!members, tasks: !!tasks })
          setLoading(false)
          return
        }

        // Group members by department/team (only include users with teamId)
        const departmentMap = new Map<string, typeof members>()
        
        members.forEach(member => {
          // Only include users who have a teamId assigned
          if (member.teamId) {
            const department = member.teamId
            if (!departmentMap.has(department)) {
              departmentMap.set(department, [])
            }
            departmentMap.get(department)!.push(member)
          }
        })


        // Calculate performance for each department
        const departmentPerformance: DepartmentPerformance[] = Array.from(departmentMap.entries()).map(([departmentName, departmentMembers]) => {
          const memberIds = departmentMembers.map(member => member.id)
          const departmentTasks = tasks.filter(task => 
            task.assigneeIds?.some(id => memberIds.includes(id)) || 
            memberIds.includes(task.userId)
          )

          const completedTasks = departmentTasks.filter(task => task.status === 'completed')
          const overdueTasks = departmentTasks.filter(task => {
            if (task.status === 'completed' || !task.dueDate) return false
            return new Date(task.dueDate) < new Date()
          })

          const completionRate = departmentTasks.length > 0 
            ? Math.round((completedTasks.length / departmentTasks.length) * 100)
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
            name: departmentName,
            memberCount: departmentMembers.length,
            tasksCompleted: completedTasks.length,
            completionRate,
            averageTime,
            overdueTasks: overdueTasks.length
          }
        })

        // Calculate overall statistics
        const totalEmployees = members.length
        const totalDepartments = departmentPerformance.length
        const overallCompletionRate = totalDepartments > 0
          ? Math.round(departmentPerformance.reduce((sum, dept) => sum + dept.completionRate, 0) / totalDepartments)
          : 0

        const averageTaskTime = totalDepartments > 0
          ? Math.round(departmentPerformance.reduce((sum, dept) => sum + dept.averageTime, 0) / totalDepartments)
          : 0

        setReportData({
          totalEmployees,
          totalDepartments,
          overallCompletionRate,
          averageTaskTime,
          departments: departmentPerformance
        })
      } catch (err) {
        console.error('Error generating organization report:', err)
        setError('Failed to generate organization report')
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [members, tasks])

  return {
    reportData,
    loading,
    error
  }
}
