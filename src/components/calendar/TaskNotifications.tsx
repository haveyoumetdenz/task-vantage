import React, { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Task } from '@/hooks/useFirebaseTasks'
import { TeamTask } from '@/hooks/useFirebaseTeamHierarchyTasks'
import { getDeadlineInfo } from '@/utils/deadlines'
import { Bell, Clock, AlertTriangle } from 'lucide-react'

interface TaskNotificationsProps {
  tasks: (Task | TeamTask)[]
}

export const TaskNotifications: React.FC<TaskNotificationsProps> = ({ tasks }) => {
  const { toast } = useToast()

  useEffect(() => {
    const checkTaskDeadlines = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        if (!task.due_date || task.status === 'completed') return

        const deadlineInfo = getDeadlineInfo(task.due_date, task.status, task.completed_at)
        
        // Show notification for tasks due soon (within 24 hours) - only once per session
        if (deadlineInfo.status === 'due_soon') {
          const notificationKey = `task-due-soon-${task.id}`
          const hasShownNotification = sessionStorage.getItem(notificationKey)
          
          if (!hasShownNotification) {
            toast({
              title: "Task Due Soon",
              description: `"${task.title}" is due within 24 hours`,
              duration: 10000,
              action: (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              ),
            })
            sessionStorage.setItem(notificationKey, 'true')
          }
        }
        
        // Show notification for overdue tasks - only once per session
        if (deadlineInfo.status === 'overdue') {
          const notificationKey = `task-overdue-${task.id}`
          const hasShownNotification = sessionStorage.getItem(notificationKey)
          
          if (!hasShownNotification) {
            toast({
              title: "Task Overdue",
              description: `"${task.title}" is overdue and needs attention`,
              variant: "destructive",
              duration: 15000,
              action: (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              ),
            })
            sessionStorage.setItem(notificationKey, 'true')
          }
        }
      })
    }

    // Check immediately
    checkTaskDeadlines()

    // Set up interval to check every hour
    const interval = setInterval(checkTaskDeadlines, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tasks, toast])

  // Request browser notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return null // This component doesn't render anything visible
}

// Helper function to show browser notifications
export const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    })
  }
}