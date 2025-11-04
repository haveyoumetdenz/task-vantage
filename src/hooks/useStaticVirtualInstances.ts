import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { Task } from '@/hooks/useFirebaseTasks'
import { addDays, format, parseISO } from 'date-fns'
import { setRecurringOverride, getAllRecurringOverrides } from '@/utils/recurringTaskInstances'

export interface StaticVirtualInstance {
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

export const useStaticVirtualInstances = (tasks: Task[], startDate: Date, endDate: Date) => {
  const { user } = useAuth()
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Task>>>({})
  const [loading, setLoading] = useState(true)

  // Load existing overrides from Firestore
  useEffect(() => {
    const loadOverrides = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const overrides = await getAllRecurringOverrides()
        
        // Convert overrides to local state format
        const overrideMap: Record<string, Partial<Task>> = {}
        overrides.forEach(override => {
          const key = `${override.taskId}_${override.date}`
          overrideMap[key] = override.overrides
        })
        
        setLocalOverrides(overrideMap)
        console.log('Loaded overrides from Firestore:', overrideMap)
      } catch (error) {
        console.error('Error loading overrides:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOverrides()
  }, [user])

  // Use useMemo to prevent infinite loops - only recalculate when dependencies actually change
  const baseInstances = useMemo(() => {
    if (!user) return []

    try {
      const recurringTasks = tasks.filter(task => task.isRecurring && task.recurrence)
      const allInstances: StaticVirtualInstance[] = []

      for (const task of recurringTasks) {
        const instances = generateTaskInstances(task, startDate, endDate)
        allInstances.push(...instances)
      }

      console.log('Generated static virtual instances:', allInstances.length)
      return allInstances
    } catch (err) {
      console.error('Error generating virtual instances:', err)
      return []
    }
  }, [user, tasks, startDate, endDate])

  // Apply local overrides to the base instances
  const virtualInstances = useMemo(() => {
    return baseInstances.map(instance => {
      // Safety check for dueDate
      if (!instance.dueDate) {
        console.warn('Base instance missing dueDate:', instance)
        return instance
      }
      
      try {
        const overrideKey = `${instance.parentTaskId}_${format(parseISO(instance.dueDate), 'yyyy-MM-dd')}`
        const override = localOverrides[overrideKey]
        
        if (override) {
          // Ensure dueDate is preserved in the override
          const mergedInstance = { ...instance, ...override }
          if (!mergedInstance.dueDate) {
            mergedInstance.dueDate = instance.dueDate
          }
          return mergedInstance
        }
        
        return instance
      } catch (error) {
        console.error('Error processing virtual instance:', instance, error)
        return instance
      }
    })
  }, [baseInstances, localOverrides])

  const updateInstance = async (taskId: string, date: string, updates: Partial<Task>) => {
    const overrideKey = `${taskId}_${date}`
    
    // Ensure we don't accidentally overwrite critical fields
    const safeUpdates = { ...updates }
    
    // Remove any fields that shouldn't be overridden
    delete safeUpdates.dueDate
    delete safeUpdates.parentTaskId
    delete safeUpdates.id
    
    try {
      // Save to Firestore
      await setRecurringOverride(taskId, date, safeUpdates)
      
      // Update local state
      setLocalOverrides(prev => ({
        ...prev,
        [overrideKey]: { ...prev[overrideKey], ...safeUpdates }
      }))
      
      console.log('Instance updated and saved to Firestore:', taskId, date, safeUpdates)
    } catch (error) {
      console.error('Error updating virtual instance:', error)
      // Still update local state even if Firestore fails
      setLocalOverrides(prev => ({
        ...prev,
        [overrideKey]: { ...prev[overrideKey], ...safeUpdates }
      }))
    }
  }

  return {
    virtualInstances,
    loading,
    updateInstance
  }
}

const generateTaskInstances = (task: Task, startDate: Date, endDate: Date): StaticVirtualInstance[] => {
  if (!task.recurrence || !task.dueDate) return []

  const instances: StaticVirtualInstance[] = []
  const taskStartDate = parseISO(task.dueDate)
  const recurrence = task.recurrence

  // Generate instances based on recurrence pattern
  let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()))
  const rangeEnd = new Date(Math.min(endDate.getTime(), recurrence.endDate ? parseISO(recurrence.endDate).getTime() : endDate.getTime()))

  while (currentDate <= rangeEnd) {
    if (matchesRecurrencePattern(currentDate, taskStartDate, recurrence)) {
      const instance: StaticVirtualInstance = {
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
