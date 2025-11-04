import { Task } from '@/hooks/useFirebaseTasks'

export interface TaskData {
  id?: string
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority?: number
  dueDate?: string
  projectId?: string
  projectTitle?: string
  userId: string
  assigneeIds?: string[]
  createdAt?: string
  updatedAt?: string
  isRecurring?: boolean
  recurrenceConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endCondition: 'never' | 'after' | 'until'
    endValue?: number | string
    startDate: string
  }
}

export const createTaskData = (overrides: Partial<TaskData> = {}): TaskData => {
  const now = new Date().toISOString()
  
  return {
    id: `task-${Date.now()}`,
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    projectId: 'test-project-id',
    projectTitle: 'Test Project',
    userId: 'test-user-id',
    assigneeIds: ['test-user-id'],
    createdAt: now,
    updatedAt: now,
    isRecurring: false,
    ...overrides,
  }
}

export const createRecurringTaskData = (overrides: Partial<TaskData> = {}): TaskData => {
  const now = new Date().toISOString()
  const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
  
  return {
    ...createTaskData(overrides),
    title: 'Recurring Test Task',
    isRecurring: true,
    recurrenceConfig: {
      frequency: 'daily',
      interval: 1,
      endCondition: 'after',
      endValue: 7,
      startDate,
    },
    ...overrides,
  }
}

export const createTaskWithProject = (projectId: string, projectTitle: string, overrides: Partial<TaskData> = {}): TaskData => {
  return createTaskData({
    projectId,
    projectTitle,
    ...overrides,
  })
}

export const createTaskWithAssignees = (assigneeIds: string[], overrides: Partial<TaskData> = {}): TaskData => {
  return createTaskData({
    assigneeIds,
    ...overrides,
  })
}

export const createCompletedTask = (overrides: Partial<TaskData> = {}): TaskData => {
  return createTaskData({
    status: 'done',
    ...overrides,
  })
}

export const createOverdueTask = (overrides: Partial<TaskData> = {}): TaskData => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  return createTaskData({
    dueDate: yesterday,
    status: 'todo',
    ...overrides,
  })
}

export const createHighPriorityTask = (overrides: Partial<TaskData> = {}): TaskData => {
  return createTaskData({
    priority: 5,
    ...overrides,
  })
}




