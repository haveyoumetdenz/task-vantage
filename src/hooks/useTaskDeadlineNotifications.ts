import { useEffect } from 'react'
import { useFirebaseTasks } from './useFirebaseTasks'
import { useFirebaseTeamHierarchyTasks } from './useFirebaseTeamHierarchyTasks'
import { createTaskOverdueNotification, createTaskDueSoonNotification } from '@/utils/notifications'
import { getDeadlineInfo } from '@/utils/deadlines'

export const useTaskDeadlineNotifications = () => {
  const { tasks } = useFirebaseTasks()
  const { teamTasks } = useFirebaseTeamHierarchyTasks()

  useEffect(() => {
    const checkTaskDeadlines = () => {
      const now = new Date()
      const allTasks = [...tasks, ...teamTasks]
      
      console.log('🔔 Checking task deadlines for', allTasks.length, 'tasks')
      
      allTasks.forEach(async (task) => {
        if (!task.due_date || task.status === 'completed') return

        const deadlineInfo = getDeadlineInfo(task.due_date, task.status, task.completed_at)
        
        // Check for overdue tasks
        if (deadlineInfo.status === 'overdue') {
          const notificationKey = `task-overdue-${task.id}`
          const hasShownNotification = sessionStorage.getItem(notificationKey)
          
          if (!hasShownNotification) {
            console.log('🔔 Task is overdue:', task.title)
            
            // Send notification to all assignees
            const assigneeIds = task.assigneeIds || []
            if (assigneeIds.length > 0) {
              try {
                await Promise.all(
                  assigneeIds.map(assigneeId => 
                    createTaskOverdueNotification(assigneeId, task.title, task.id)
                  )
                )
                console.log('✅ Overdue notifications sent for task:', task.title)
                sessionStorage.setItem(notificationKey, 'true')
              } catch (error) {
                console.error('❌ Error sending overdue notifications:', error)
              }
            }
          }
        }
        
        // Check for tasks due soon (within 24 hours)
        if (deadlineInfo.status === 'due_soon') {
          const notificationKey = `task-due-soon-${task.id}`
          const hasShownNotification = sessionStorage.getItem(notificationKey)
          
          if (!hasShownNotification) {
            console.log('🔔 Task is due soon:', task.title)
            
            // Send notification to all assignees
            const assigneeIds = task.assigneeIds || []
            if (assigneeIds.length > 0) {
              try {
                await Promise.all(
                  assigneeIds.map(assigneeId => 
                    createTaskDueSoonNotification(assigneeId, task.title, task.id)
                  )
                )
                console.log('✅ Due soon notifications sent for task:', task.title)
                sessionStorage.setItem(notificationKey, 'true')
              } catch (error) {
                console.error('❌ Error sending due soon notifications:', error)
              }
            }
          }
        }
      })
    }

    // Check immediately
    checkTaskDeadlines()
    
    // Check every 5 minutes
    const interval = setInterval(checkTaskDeadlines, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [tasks, teamTasks])
}
