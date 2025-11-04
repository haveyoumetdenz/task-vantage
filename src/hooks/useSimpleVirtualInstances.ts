import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { Task } from '@/hooks/useFirebaseTasks'
import { addDays, format, parseISO } from 'date-fns'

export interface SimpleVirtualInstance {
  id: string
  parentTaskId: string
  dueDate: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  title: string
  description?: string
  priority: number
  assigneeIds: string[]
  projectId?: string
  userId: string
  isRecurring: boolean
}

export const useSimpleVirtualInstances = (tasks: Task[], startDate: Date, endDate: Date) => {
  const { user } = useAuth()
  const [virtualInstances, setVirtualInstances] = useState<SimpleVirtualInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const generateInstances = () => {
      try {
        const recurringTasks = tasks.filter(task => task.isRecurring && task.recurrence)
        const allInstances: SimpleVirtualInstance[] = []

        for (const task of recurringTasks) {
          const instances = generateTaskInstances(task, startDate, endDate)
          allInstances.push(...instances)
        }

        setVirtualInstances(allInstances)
        console.log('Generated simple virtual instances:', allInstances.length)
      } catch (err) {
        console.error('Error generating virtual instances:', err)
      } finally {
        setLoading(false)
      }
    }

    // Use a timeout to prevent immediate re-renders
    const timeoutId = setTimeout(generateInstances, 0)
    return () => clearTimeout(timeoutId)
  }, [user, tasks.length, startDate.getTime(), endDate.getTime()])

  const updateInstance = (taskId: string, date: string, updates: Partial<Task>) => {
    setVirtualInstances(prevInstances => 
      prevInstances.map(instance => {
        if (instance.parentTaskId === taskId && instance.dueDate.split('T')[0] === date) {
          return { ...instance, ...updates }
        }
        return instance
      })
    )
    console.log('Instance updated:', taskId, date, updates)
  }

  return {
    virtualInstances,
    loading,
    updateInstance
  }
}

const generateTaskInstances = (task: Task, startDate: Date, endDate: Date): SimpleVirtualInstance[] => {
  if (!task.recurrence || !task.dueDate) return []

  const instances: SimpleVirtualInstance[] = []
  const taskStartDate = parseISO(task.dueDate)
  const recurrence = task.recurrence

  // Generate instances based on recurrence pattern
  let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()))
  const rangeEnd = new Date(Math.min(endDate.getTime(), recurrence.endDate ? parseISO(recurrence.endDate).getTime() : endDate.getTime()))

  while (currentDate <= rangeEnd) {
    if (matchesRecurrencePattern(currentDate, taskStartDate, recurrence)) {
      const instance: SimpleVirtualInstance = {
        id: `${task.id}_${format(currentDate, 'yyyy-MM-dd')}`,
        parentTaskId: task.id,
        dueDate: currentDate.toISOString(),
        status: task.status,
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeIds: task.assigneeIds || [],
        projectId: task.projectId,
        userId: task.userId,
        isRecurring: true
      }
      instances.push(instance)
    }

    currentDate = addDays(currentDate, 1)
  }

  return instances
}

const matchesRecurrencePattern = (
  checkDate: Date, 
  startDate: Date, 
  recurrence: Task['recurrence']
): boolean => {
  if (!recurrence) return false

  const interval = recurrence.interval || 1
  const frequency = recurrence.frequency

  switch (frequency) {
    case 'daily':
      return Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) % interval === 0
    case 'weekly':
      return Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) % interval === 0
    case 'monthly':
      const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (checkDate.getMonth() - startDate.getMonth())
      return monthsDiff % interval === 0 && checkDate.getDate() === startDate.getDate()
    case 'yearly':
      const yearsDiff = checkDate.getFullYear() - startDate.getFullYear()
      return yearsDiff % interval === 0 && 
             checkDate.getMonth() === startDate.getMonth() && 
             checkDate.getDate() === startDate.getDate()
    default:
      return false
  }
}
