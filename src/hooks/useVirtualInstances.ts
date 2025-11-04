import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { Task } from '@/hooks/useFirebaseTasks'
import { 
  VirtualInstance, 
  generateVirtualInstances, 
  getVirtualInstance, 
  updateVirtualInstance,
  getNextRecurringInstance,
  getOverdueRecurringInstances,
  getRecurringTaskOverrides
} from '@/utils/recurringTaskInstances'

export const useVirtualInstances = (tasks: Task[], startDate: Date, endDate: Date) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localInstances, setLocalInstances] = useState<VirtualInstance[]>([])

  // Memoize the virtual instances to prevent infinite re-renders
  const baseInstances = useMemo(() => {
    if (!user) return []

    try {
      const recurringTasks = tasks.filter(task => task.isRecurring)
      const allInstances: VirtualInstance[] = []

      for (const task of recurringTasks) {
        const instances = generateVirtualInstances(task, startDate, endDate)
        allInstances.push(...instances)
      }

      console.log('Generated virtual instances:', allInstances.length)
      return allInstances
    } catch (err) {
      console.error('Error generating virtual instances:', err)
      setError('Failed to generate virtual instances')
      return []
    }
  }, [user, tasks, startDate, endDate])

  useEffect(() => {
    setLocalInstances(baseInstances)
    setLoading(false)
  }, [baseInstances])

  const virtualInstances = localInstances

  const updateInstance = async (taskId: string, date: string, updates: Partial<Task>) => {
    try {
      console.log('Updating instance:', taskId, date, updates)
      
      // For now, just update the local state without Firestore
      setLocalInstances(prevInstances => 
        prevInstances.map(instance => {
          if (instance.parentTaskId === taskId && instance.dueDate.split('T')[0] === date) {
            return { ...instance, ...updates }
          }
          return instance
        })
      )
      
      console.log('Instance updated locally (Firestore rules need to be updated for persistence)')
    } catch (err) {
      console.error('Error updating virtual instance:', err)
      setError('Failed to update instance')
    }
  }

  const getInstancesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return virtualInstances.filter(instance => 
      instance.dueDate.split('T')[0] === dateStr
    )
  }

  const getInstancesForTask = (taskId: string) => {
    return virtualInstances.filter(instance => instance.parentTaskId === taskId)
  }

  const getNextInstanceForTask = (task: Task) => {
    return getNextRecurringInstance(task)
  }

  const getOverdueInstancesForTask = (task: Task) => {
    return getOverdueRecurringInstances(task)
  }

  return {
    virtualInstances,
    loading,
    error,
    updateInstance,
    getInstancesForDate,
    getInstancesForTask,
    getNextInstanceForTask,
    getOverdueInstancesForTask
  }
}

export const useRecurringTaskSummary = (task: Task) => {
  const [nextInstance, setNextInstance] = useState<VirtualInstance | null>(null)
  const [overdueInstances, setOverdueInstances] = useState<VirtualInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!task.isRecurring) {
      setLoading(false)
      return
    }

    const loadSummary = async () => {
      try {
        setLoading(true)
        
        const next = getNextRecurringInstance(task)
        const overdue = getOverdueRecurringInstances(task)
        
        setNextInstance(next)
        setOverdueInstances(overdue)
      } catch (error) {
        console.error('Error loading recurring task summary:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [task])

  return {
    nextInstance,
    overdueInstances,
    loading
  }
}

