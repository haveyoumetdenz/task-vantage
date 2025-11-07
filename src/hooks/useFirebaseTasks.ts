import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { createTaskAssignmentNotification, createTaskCompletionNotification } from '@/utils/notifications'
import { useToast } from '@/hooks/use-toast'
import { updateProjectProgress } from '@/utils/projectProgress'
import { validateTaskData, sanitizeTaskData } from '@/utils/taskValidation'
import { createActivityLogEntry } from '@/utils/activityLog'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: number // 1-10 scale (10 being most urgent)
  dueDate?: string
  completedAt?: string
  userId: string
  projectId?: string
  assigneeIds?: string[]
  isRecurring?: boolean
  parentTaskId?: string
  recurrence?: {
    id: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    maxOccurrences?: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority?: number // 1-10 scale (10 being most urgent)
  dueDate?: string
  projectId?: string
  assigneeIds?: string[]
  isRecurring?: boolean
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    maxOccurrences?: number
  }
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
  completedAt?: string | null
}

export const useFirebaseTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    // Create query for tasks
    let q
    if (projectId) {
      // For project views, show ALL tasks in the project (not just assigned to user)
      q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      )
    } else {
      // For general task views, show:
      // 1. Tasks assigned to user (assigneeIds contains user.uid)
      // 2. Tasks where user is mentioned in activity log
      // We'll fetch both and merge them
      
      // First query: tasks assigned to user
      const assignedTasksQuery = query(
        collection(db, 'tasks'),
        where('assigneeIds', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      )
      
      // Second query: find tasks where user is mentioned in activities
      const mentionedActivitiesQuery = query(
        collection(db, 'activities'),
        where('entityType', '==', 'task'),
        where('mentions', 'array-contains', user.uid),
        orderBy('timestamp', 'desc')
      )
      
      // Set up listeners for both queries
      const unsubscribes: (() => void)[] = []
      const allTasksMap = new Map<string, Task>()
      
      const updateTasks = () => {
        const tasksArray = Array.from(allTasksMap.values())
        const processedTasks = tasksArray.map(task => ({
          ...task,
          isRecurring: task.isRecurring === true
        })) as Task[]
        setTasks(processedTasks)
        setLoading(false)
      }
      
      // Listen to assigned tasks
      const unsubscribeAssigned = onSnapshot(assignedTasksQuery, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          allTasksMap.set(doc.id, {
            id: doc.id,
            ...data,
            isRecurring: data.isRecurring === true
          } as Task)
        })
        updateTasks()
      }, (error) => {
        console.error('Tasks query error:', error)
        setLoading(false)
      })
      unsubscribes.push(unsubscribeAssigned)
      
      // Listen to mentioned activities and fetch those tasks
      const unsubscribeMentions = onSnapshot(mentionedActivitiesQuery, async (snapshot) => {
        const mentionedTaskIds = new Set<string>()
        snapshot.docs.forEach(doc => {
          const activityData = doc.data()
          if (activityData.entityId) {
            mentionedTaskIds.add(activityData.entityId)
          }
        })
        
        // Fetch tasks that were mentioned
        const taskPromises = Array.from(mentionedTaskIds).map(async (taskId) => {
          try {
            const taskDoc = await getDoc(doc(db, 'tasks', taskId))
            if (taskDoc.exists()) {
              const taskData = taskDoc.data()
              return {
                id: taskDoc.id,
                ...taskData,
                isRecurring: taskData.isRecurring === true
              } as Task
            }
          } catch (error) {
            console.error(`Error fetching mentioned task ${taskId}:`, error)
          }
          return null
        })
        
        const mentionedTasks = (await Promise.all(taskPromises)).filter((t): t is Task => t !== null)
        mentionedTasks.forEach(task => {
          allTasksMap.set(task.id, task)
        })
        updateTasks()
      }, (error) => {
        console.error('Mentioned activities query error:', error)
      })
      unsubscribes.push(unsubscribeMentions)
      
      return () => {
        unsubscribes.forEach(unsub => unsub())
      }
    }

    // Handle project views separately
    if (projectId) {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      )
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data()
          console.log('Raw task data from Firebase:', doc.id, data)
          console.log('isRecurring in raw data:', data.isRecurring)
          const processedTask = {
            id: doc.id,
            ...data,
            // Ensure isRecurring is always a boolean, defaulting to false if undefined
            isRecurring: data.isRecurring === true
          }
          console.log('Processed task isRecurring:', processedTask.isRecurring)
          return processedTask
        }) as Task[]
        console.log('Processed tasks data:', tasksData)
        setTasks(tasksData)
        setLoading(false)
      }, (error) => {
        console.error('Tasks query error:', error)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [user, projectId])

  const createTask = async (taskData: CreateTaskData) => {
    if (!user) return null

    try {
      // Validate task data before processing
      const validation = validateTaskData(taskData)
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        })
        return null
      }

      // Sanitize and filter out undefined values to avoid Firestore errors
      const sanitizedData = sanitizeTaskData(taskData)
      const filteredTaskData = Object.fromEntries(
        Object.entries(sanitizedData).filter(([_, value]) => value !== undefined)
      )

      // Handle recurrence object separately to filter out undefined values
      let recurrenceData = undefined
      if (filteredTaskData.isRecurring && filteredTaskData.recurrence) {
        console.log('Original recurrence data:', filteredTaskData.recurrence)
        recurrenceData = Object.fromEntries(
          Object.entries(filteredTaskData.recurrence).filter(([_, value]) => value !== undefined)
        )
        console.log('Filtered recurrence data:', recurrenceData)
        // If recurrence object is empty after filtering, set to undefined
        if (Object.keys(recurrenceData).length === 0) {
          recurrenceData = undefined
        }
      }

      const taskDoc = {
        ...filteredTaskData,
        userId: user.uid,
        status: filteredTaskData.status || 'todo',
        priority: filteredTaskData.priority || 5, // Default priority 5 (middle of 1-10 scale)
        assigneeIds: filteredTaskData.assigneeIds || [user.uid], // Default to current user if no assignees
        isRecurring: filteredTaskData.isRecurring || false,
        ...(recurrenceData && { recurrence: recurrenceData }), // Only include recurrence if it has data
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('Final task document to save:', taskDoc)
      const docRef = await addDoc(collection(db, 'tasks'), taskDoc)
      
      // Create activity log entry for task creation
      await createActivityLogEntry({
        entityType: 'task',
        entityId: docRef.id,
        type: 'creation',
        userId: user.uid,
        userName: user.email || 'Someone',
        content: `Task "${taskDoc.title}" was created`
      })
      
      // Send assignment notifications to all assignees (except the creator)
      const assigneeIds = taskDoc.assigneeIds || []
      const otherAssignees = assigneeIds.filter(id => id !== user.uid)
      
      if (otherAssignees.length > 0) {
        console.log('🔔 Sending task assignment notifications to:', otherAssignees)
        try {
          await Promise.all(
            otherAssignees.map(assigneeId => 
              createTaskAssignmentNotification(
                assigneeId, 
                taskDoc.title, 
                docRef.id, 
                user.email || 'Someone'
              )
            )
          )
          console.log('✅ Task assignment notifications sent')
        } catch (error) {
          console.error('❌ Error sending task assignment notifications:', error)
        }
        
        // Create activity log entry for assignment
        await createActivityLogEntry({
          entityType: 'task',
          entityId: docRef.id,
          type: 'assignment',
          userId: user.uid,
          userName: user.email || 'Someone',
          content: `Task assigned to ${otherAssignees.length} user${otherAssignees.length !== 1 ? 's' : ''}`
        })
      }
      
      // Update project progress if task is created as completed
      if (taskDoc.status === 'completed' && taskDoc.projectId) {
        console.log(`📊 Task ${docRef.id} created as completed, updating project ${taskDoc.projectId} progress`)
        try {
          // Get all tasks including the newly created one
          const allTasks = [...tasks, { ...taskDoc, id: docRef.id }]
          await updateProjectProgress(taskDoc.projectId, allTasks)
        } catch (error) {
          console.error('❌ Error updating project progress for new completed task:', error)
          // Don't fail the task creation if project progress update fails
        }
      }
      
      toast({
        title: 'Success',
        description: 'Task created successfully',
      })

      return { id: docRef.id, ...taskDoc }
    } catch (error: any) {
      console.error('Create task error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      })
      return null
    }
  }

  const updateTask = async (taskData: UpdateTaskData) => {
    if (!user) return null

    try {
      const { id, ...updateData } = taskData
      const taskRef = doc(db, 'tasks', id)
      
      const currentTask = tasks.find(t => t.id === id)
      
      // Check if user is trying to reassign tasks (change assignees)
      if (updateData.assigneeIds && currentTask) {
        const oldAssignees = currentTask.assigneeIds || []
        const newAssignees = updateData.assigneeIds || []
        const assigneesChanged = JSON.stringify(oldAssignees.sort()) !== JSON.stringify(newAssignees.sort())
        
        // Only assignees can reassign tasks
        if (assigneesChanged && !oldAssignees.includes(user.uid)) {
          toast({
            title: "Permission Denied",
            description: "Only assignees can reassign tasks.",
            variant: "destructive",
          })
          return null
        }
      }
      
      // Filter out undefined values to avoid Firestore errors
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      await updateDoc(taskRef, {
        ...filteredUpdateData,
        updatedAt: new Date().toISOString()
      })

      // Create activity log entries for changes
      if (currentTask) {
        // Status change activity
        if (updateData.status && updateData.status !== currentTask.status) {
          const statusLabels: Record<string, string> = {
            todo: 'To Do',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled'
          }
          
          await createActivityLogEntry({
            entityType: 'task',
            entityId: id,
            type: 'status_change',
            userId: user.uid,
            userName: user.email || 'Someone',
            content: `Status changed from "${statusLabels[currentTask.status] || currentTask.status}" to "${statusLabels[updateData.status] || updateData.status}"`,
            metadata: {
              field: 'status',
              oldValue: currentTask.status,
              newValue: updateData.status
            }
          })
        }
        
        // Assignment change activity
        if (updateData.assigneeIds) {
          const oldAssignees = currentTask.assigneeIds || []
          const newAssignees = updateData.assigneeIds
          const newlyAssigned = newAssignees.filter(id => !oldAssignees.includes(id))
          const removedAssignees = oldAssignees.filter(id => !newAssignees.includes(id))
          
          if (newlyAssigned.length > 0 || removedAssignees.length > 0) {
            let content = ''
            if (newlyAssigned.length > 0) {
              content += `Assigned to ${newlyAssigned.length} new user${newlyAssigned.length !== 1 ? 's' : ''}`
            }
            if (removedAssignees.length > 0) {
              if (content) content += '. '
              content += `Removed ${removedAssignees.length} assignee${removedAssignees.length !== 1 ? 's' : ''}`
            }
            
            await createActivityLogEntry({
              entityType: 'task',
              entityId: id,
              type: 'assignment',
              userId: user.uid,
              userName: user.email || 'Someone',
              content
            })
          }
        }
      }

      // Send assignment notifications if assignees are being updated
      if (updateData.assigneeIds && currentTask) {
        const oldAssignees = currentTask.assigneeIds || []
        const newAssignees = updateData.assigneeIds
        const newlyAssigned = newAssignees.filter(id => !oldAssignees.includes(id))
        
        if (newlyAssigned.length > 0) {
          console.log('🔔 Sending task assignment notifications to new assignees:', newlyAssigned)
          try {
            await Promise.all(
              newlyAssigned.map(assigneeId => 
                createTaskAssignmentNotification(
                  assigneeId, 
                  currentTask.title, 
                  id, 
                  user.email || 'Someone'
                )
              )
            )
            console.log('✅ Task assignment notifications sent')
          } catch (error) {
            console.error('❌ Error sending task assignment notifications:', error)
          }
        }
      }

      // Send completion notification if task is being completed
      if (updateData.status === 'completed' && currentTask) {
        const assigneeIds = currentTask.assigneeIds || []
        const otherAssignees = assigneeIds.filter(assigneeId => assigneeId !== user.uid)
        
        // Create completion activity log entry
        await createActivityLogEntry({
          entityType: 'task',
          entityId: id,
          type: 'completion',
          userId: user.uid,
          userName: user.email || 'Someone',
          content: `Task "${currentTask.title}" was marked as completed`
        })
        
        if (otherAssignees.length > 0) {
          console.log('🔔 Sending task completion notifications to:', otherAssignees)
          try {
            await Promise.all(
              otherAssignees.map(assigneeId => 
                createTaskCompletionNotification(
                  assigneeId, 
                  currentTask.title, 
                  id, 
                  user.email || 'Someone'
                )
              )
            )
            console.log('✅ Task completion notifications sent')
          } catch (error) {
            console.error('❌ Error sending task completion notifications:', error)
          }
        }
      }

      // If task is being completed and it's recurring, generate next occurrence
      if (updateData.status === 'completed' && updateData.isRecurring) {
        await generateNextRecurringTask(id)
      }

      // Update project progress if task status changed to completed
      if (updateData.status === 'completed') {
        const currentTask = tasks.find(t => t.id === id)
        if (currentTask && currentTask.projectId) {
          console.log(`📊 Task ${id} completed, updating project ${currentTask.projectId} progress`)
          try {
            await updateProjectProgress(currentTask.projectId, tasks)
          } catch (error) {
            console.error('❌ Error updating project progress:', error)
            // Don't fail the task update if project progress update fails
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Task updated successfully',
      })

      return true
    } catch (error: any) {
      console.error('Update task error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      })
      return null
    }
  }

  // Generate next occurrence for recurring tasks
  const generateNextRecurringTask = async (completedTaskId: string) => {
    try {
      // Get the completed task
      const taskQuery = query(collection(db, 'tasks'), where('id', '==', completedTaskId))
      const taskSnapshot = await getDocs(taskQuery)
      
      if (taskSnapshot.empty) return

      const completedTask = taskSnapshot.docs[0].data() as Task
      
      if (!completedTask.isRecurring || !completedTask.recurrence) return

      // Check if we should create the next occurrence
      const shouldCreateNext = checkIfShouldCreateNext(completedTask.recurrence)
      if (!shouldCreateNext) return

      // Calculate next due date
      const nextDueDate = calculateNextDueDate(completedTask.dueDate || new Date().toISOString(), completedTask.recurrence)
      
      // Create the next occurrence
      const nextTask = {
        ...completedTask,
        id: '', // Will be generated by Firestore
        dueDate: nextDueDate,
        status: 'todo' as const,
        parentTaskId: completedTask.parentTaskId || completedTask.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Remove the recurrence field from the new task (it's only on the original)
      delete nextTask.recurrence

      const nextTaskRef = await addDoc(collection(db, 'tasks'), nextTask)

      toast({
        title: 'Success',
        description: 'Next recurring task created',
      })

      return nextTaskRef.id
    } catch (error) {
      console.error('Error generating next recurring task:', error)
    }
  }

  // Check if we should create the next occurrence
  const checkIfShouldCreateNext = (recurrence: Task['recurrence']): boolean => {
    if (!recurrence) return false
    
    const now = new Date()
    
    // Check end date
    if (recurrence.endDate && new Date(recurrence.endDate) <= now) {
      return false
    }

    // Check max occurrences (would need to track this in the recurrence rule)
    if (recurrence.maxOccurrences && recurrence.maxOccurrences <= 0) {
      return false
    }

    return true
  }

  // Calculate next due date based on recurrence rule
  const calculateNextDueDate = (currentDueDate: string, recurrence: Task['recurrence']): string => {
    if (!recurrence) return currentDueDate
    
    const currentDate = new Date(currentDueDate)
    const interval = recurrence.interval || 1

    switch (recurrence.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (interval * 7))
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval)
        break
    }

    return currentDate.toISOString()
  }

  const deleteTask = async (taskId: string) => {
    if (!user) return false

    try {
      // Get the task before deleting to check if it has a projectId
      const taskToDelete = tasks.find(t => t.id === taskId)
      const projectId = taskToDelete?.projectId
      
      // Create activity log entry for deletion (before deleting)
      if (taskToDelete) {
        await createActivityLogEntry({
          entityType: 'task',
          entityId: taskId,
          type: 'status_change',
          userId: user.uid,
          userName: user.email || 'Someone',
          content: `Task "${taskToDelete.title}" was deleted`
        })
      }
      
      await deleteDoc(doc(db, 'tasks', taskId))
      
      // Update project progress if the deleted task was associated with a project
      if (projectId) {
        console.log(`📊 Task ${taskId} deleted, updating project ${projectId} progress`)
        try {
          // Get remaining tasks for this project (excluding the deleted one)
          const remainingTasks = tasks.filter(t => t.id !== taskId)
          await updateProjectProgress(projectId, remainingTasks)
        } catch (error) {
          console.error('❌ Error updating project progress after task deletion:', error)
          // Don't fail the task deletion if project progress update fails
        }
      }
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      })

      return true
    } catch (error: any) {
      console.error('Delete task error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      })
      return false
    }
  }

  // Migration function to fix existing tasks missing isRecurring field
  const migrateTasksMissingIsRecurring = async () => {
    if (!user) return

    try {
      console.log('Starting migration for tasks missing isRecurring field...')
      
      // Get all tasks for the current user
      const q = query(
        collection(db, 'tasks'),
        where('assigneeIds', 'array-contains', user.uid)
      )
      
      const snapshot = await getDocs(q)
      const tasksToUpdate = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.isRecurring === undefined
      })

      console.log(`Found ${tasksToUpdate.length} tasks missing isRecurring field`)

      // Update each task to set isRecurring: false
      for (const doc of tasksToUpdate) {
        await updateDoc(doc.ref, {
          isRecurring: false,
          updatedAt: new Date().toISOString()
        })
        console.log(`Updated task ${doc.id} with isRecurring: false`)
      }

      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    generateNextRecurringTask,
    checkIfShouldCreateNext,
    calculateNextDueDate,
    migrateTasksMissingIsRecurring
  }
}
