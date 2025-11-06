import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { db, clearCollection } from '@/test/emulatorDb'
import { createTaskEmu, getTaskByIdEmu, updateTaskDueDateEmu } from '@/services/tasks.emu'
import { isTaskOverdue, isTaskDueSoon, getDeadlineStatus } from '@/utils/dueDateValidation'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearTasks() {
  await clearCollection('tasks')
}

describe('DST-COR-01: Attach/Update Due Dates (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
  })

  beforeEach(async () => {
    // Clear tasks before each test to ensure isolation
    await clearTasks()
    // Small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(async () => {
    // Clean up after each test to ensure no data leaks
    await clearTasks()
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterAll(async () => {
    // Final cleanup after all tests
    await clearTasks()
  })

  it('should add due date to task', async () => {
    const taskId = await createTaskEmu({ title: 'Task with Due Date', priority: 5 })
    
    // Wait for task to be readable before updating
    let task: any
    let retries = 0
    const maxRetries = 30
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(taskId)
      if (task.exists && task.data) {
        break
      }
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    if (!task || !task.exists) {
      throw new Error(`Task ${taskId} was not found after ${maxRetries} retries`)
    }
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const dueDate = futureDate.toISOString()
    
    await updateTaskDueDateEmu(taskId, dueDate)
    
    // Wait and retry until due date is updated
    let updatedTask: any
    retries = 0
    while (retries < maxRetries) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.due_date === dueDate) {
        break
      }
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.due_date).toBe(dueDate)
    expect(updatedTask.data?.updatedAt).toBeDefined()
  }, 60000) // Increase timeout

  it('should update existing due date', async () => {
    const futureDate1 = new Date()
    futureDate1.setDate(futureDate1.getDate() + 7)
    
    const taskId = await createTaskEmu({
      title: 'Task with Due Date',
      priority: 5,
      dueDate: futureDate1.toISOString()
    })
    
    const futureDate2 = new Date()
    futureDate2.setDate(futureDate2.getDate() + 14)
    
    await updateTaskDueDateEmu(taskId, futureDate2.toISOString())
    
    const task = await getTaskByIdEmu(taskId)
    expect(task.data?.due_date).toBe(futureDate2.toISOString())
  })

  it('should detect overdue task', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    expect(isTaskOverdue(pastDate.toISOString(), 'todo')).toBe(true)
    expect(isTaskOverdue(pastDate.toISOString(), 'completed')).toBe(false)
    expect(isTaskOverdue(pastDate.toISOString(), 'cancelled')).toBe(false)
  })

  it('should detect task due soon (within 24 hours)', () => {
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 12)
    
    expect(isTaskDueSoon(futureDate.toISOString(), 'todo')).toBe(true)
    expect(isTaskDueSoon(futureDate.toISOString(), 'completed')).toBe(false)
  })

  it('should get correct deadline status', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    expect(getDeadlineStatus(pastDate.toISOString(), 'todo')).toBe('overdue')
    expect(getDeadlineStatus(pastDate.toISOString(), 'completed')).toBe('completed')
    
    const soonDate = new Date()
    soonDate.setHours(soonDate.getHours() + 12)
    
    expect(getDeadlineStatus(soonDate.toISOString(), 'todo')).toBe('due_soon')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    
    expect(getDeadlineStatus(futureDate.toISOString(), 'todo')).toBe('normal')
  })
})

