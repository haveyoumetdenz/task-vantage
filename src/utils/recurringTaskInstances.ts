import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { Task } from '@/hooks/useFirebaseTasks'
import { addDays, addWeeks, addMonths, addYears, format, parseISO, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns'

export interface RecurringTaskOverride {
  id: string // Format: `${taskId}_${date}`
  taskId: string
  date: string // YYYY-MM-DD format
  overrides: Partial<Task>
  createdAt: string
  updatedAt: string
}

export interface VirtualInstance {
  id: string // Generated: `${taskId}_${date}`
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
  // Override fields for this specific instance
  overrides?: Partial<Task>
}

/**
 * Generate virtual instances for a recurring task within a date range
 */
export const generateVirtualInstances = (
  task: Task, 
  startDate: Date, 
  endDate: Date
): VirtualInstance[] => {
  if (!task.isRecurring || !task.recurrence || !task.dueDate) {
    return []
  }

  const instances: VirtualInstance[] = []
  const taskStartDate = parseISO(task.dueDate)
  const recurrence = task.recurrence

  // Calculate all possible dates within the range
  let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()))
  const rangeEnd = new Date(Math.min(endDate.getTime(), recurrence.endDate ? parseISO(recurrence.endDate).getTime() : endDate.getTime()))

  while (currentDate <= rangeEnd) {
    // Check if this date matches the recurrence pattern
    if (matchesRecurrencePattern(currentDate, taskStartDate, recurrence)) {
      const instance: VirtualInstance = {
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

    // Move to next potential date
    currentDate = addDays(currentDate, 1)
  }

  return instances
}

/**
 * Check if a date matches the recurrence pattern
 */
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

/**
 * Get override for a specific recurring task instance
 */
export const getRecurringOverride = async (taskId: string, date: string): Promise<RecurringTaskOverride | null> => {
  try {
    const overrideId = `${taskId}_${date}`
    const overrideDoc = await getDoc(doc(db, 'recurringOverrides', overrideId))
    
    if (overrideDoc.exists()) {
      return { id: overrideId, ...overrideDoc.data() } as RecurringTaskOverride
    }
    
    return null
  } catch (error) {
    console.error('Error getting recurring override:', error)
    return null
  }
}

/**
 * Set override for a specific recurring task instance
 */
export const setRecurringOverride = async (
  taskId: string, 
  date: string, 
  overrides: Partial<Task>
): Promise<void> => {
  try {
    const overrideId = `${taskId}_${date}`
    const now = new Date().toISOString()
    
    await setDoc(doc(db, 'recurringOverrides', overrideId), {
      taskId,
      date,
      overrides,
      createdAt: now,
      updatedAt: now
    })
  } catch (error) {
    console.error('Error setting recurring override:', error)
    // If permission denied, show helpful message
    if (error.code === 'permission-denied') {
      console.warn('Permission denied: Please update your Firestore rules to allow access to recurringOverrides collection')
      console.warn('Add this rule to your firestore.rules:')
      console.warn('match /recurringOverrides/{overrideId} {')
      console.warn('  allow read, write: if request.auth != null;')
      console.warn('}')
    }
    throw error
  }
}

/**
 * Remove override for a specific recurring task instance
 */
export const removeRecurringOverride = async (taskId: string, date: string): Promise<void> => {
  try {
    const overrideId = `${taskId}_${date}`
    await deleteDoc(doc(db, 'recurringOverrides', overrideId))
  } catch (error) {
    console.error('Error removing recurring override:', error)
    throw error
  }
}

/**
 * Get all overrides for a recurring task
 */
export const getRecurringTaskOverrides = async (taskId: string): Promise<RecurringTaskOverride[]> => {
  try {
    const overridesQuery = query(
      collection(db, 'recurringOverrides'),
      where('taskId', '==', taskId)
    )
    
    const snapshot = await getDocs(overridesQuery)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTaskOverride))
  } catch (error) {
    console.error('Error getting recurring task overrides:', error)
    return []
  }
}

/**
 * Get all recurring overrides for all tasks
 */
export const getAllRecurringOverrides = async (): Promise<RecurringTaskOverride[]> => {
  try {
    const overridesQuery = query(collection(db, 'recurringOverrides'))
    const snapshot = await getDocs(overridesQuery)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTaskOverride))
  } catch (error) {
    console.error('Error getting all recurring overrides:', error)
    return []
  }
}

/**
 * Get a virtual instance with any overrides applied
 */
export const getVirtualInstance = async (task: Task, date: string): Promise<VirtualInstance> => {
  const baseInstance: VirtualInstance = {
    id: `${task.id}_${date}`,
    parentTaskId: task.id,
    dueDate: parseISO(date).toISOString(),
    status: task.status,
    title: task.title,
    description: task.description,
    priority: task.priority,
    assigneeIds: task.assigneeIds || [],
    projectId: task.projectId,
    userId: task.userId,
    isRecurring: true
  }

  // Get any overrides for this specific date
  const override = await getRecurringOverride(task.id, date)
  
  if (override) {
    return {
      ...baseInstance,
      ...override.overrides,
      overrides: override.overrides
    }
  }

  return baseInstance
}

/**
 * Update a virtual instance (creates or updates override)
 */
export const updateVirtualInstance = async (
  taskId: string, 
  date: string, 
  updates: Partial<Task>
): Promise<void> => {
  await setRecurringOverride(taskId, date, updates)
}

/**
 * Get next due instance for a recurring task
 */
export const getNextRecurringInstance = (task: Task): VirtualInstance | null => {
  if (!task.isRecurring || !task.recurrence || !task.dueDate) {
    return null
  }

  const today = new Date()
  const instances = generateVirtualInstances(task, today, addMonths(today, 3))
  
  // Find the next instance that's not completed
  const nextInstance = instances.find(instance => 
    parseISO(instance.dueDate) >= today && instance.status !== 'completed'
  )

  return nextInstance || null
}

/**
 * Get overdue instances for a recurring task
 */
export const getOverdueRecurringInstances = (task: Task): VirtualInstance[] => {
  if (!task.isRecurring || !task.recurrence || !task.dueDate) {
    return []
  }

  const today = new Date()
  const instances = generateVirtualInstances(task, addMonths(today, -1), today)
  
  return instances.filter(instance => 
    parseISO(instance.dueDate) < today && instance.status !== 'completed'
  )
}

