import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { TaskCalendar } from './TaskCalendar'

interface CalendarWithVirtualInstancesProps {
  teamMode?: boolean
  teamMembers?: any[]
}

export const CalendarWithVirtualInstances: React.FC<CalendarWithVirtualInstancesProps> = ({
  teamMode = false,
  teamMembers = []
}) => {
  const navigate = useNavigate()
  const { tasks, updateTask } = useFirebaseTasks()

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task)
    
    // Check if this is a virtual instance (has parentTaskId)
    if (task.parentTaskId) {
      // For virtual instances, navigate to the parent task
      navigate(`/tasks/${task.parentTaskId}`)
    } else {
      // For regular tasks, navigate to the task itself
      navigate(`/tasks/${task.id}`)
    }
  }

  const handleTaskUpdate = async (taskData: any) => {
    console.log('Task updated:', taskData)
    try {
      await updateTask(taskData.id, taskData)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleCreateRecurringTasks = () => {
    console.log('Create recurring tasks')
    // This would typically open a dialog or navigate to a form
    // For now, just log it
  }

  return (
    <TaskCalendar
      tasks={tasks}
      onTaskClick={handleTaskClick}
      onTaskUpdate={handleTaskUpdate}
      onCreateRecurringTasks={handleCreateRecurringTasks}
      teamMode={teamMode}
      teamMembers={teamMembers}
    />
  )
}
