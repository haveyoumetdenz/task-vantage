import { describe, it, expect, beforeAll } from 'vitest'
import { getDocs, collection } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createTaskEmu, getTaskByIdEmu, updateTaskStatusEmu } from '@/services/tasks.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearTasks() {
  await clearCollection('tasks')
}

describe('TM-COR-03: Change Task Status (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    await clearTasks()
  })

  it('should update task status from todo to in_progress', async () => {
    const taskId = await createTaskEmu({ title: 'Status Test Task', status: 'todo', priority: 5 })
    
    // Additional wait after createTaskEmu returns (it already waits, but emulator may need more time)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Wait and retry until task exists and is readable (emulator may have slight delay)
    let task: any
    let retries = 0
    const maxRetries = 40 // Increased retries even more
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(taskId)
      if (task.exists && task.data && task.data.status === 'todo') {
        // Task is fully readable and has correct status
        break
      }
      await new Promise(resolve => setTimeout(resolve, 200)) // Longer wait
      retries++
    }
    
    if (!task.exists) {
      throw new Error(`Task ${taskId} was not found after ${maxRetries} retries`)
    }
    
    expect(task.exists).toBe(true)
    expect(task.data?.status).toBe('todo')
    
    // Additional delay before update to ensure task is stable
    await new Promise(resolve => setTimeout(resolve, 200))
    
    await updateTaskStatusEmu(taskId, 'in_progress')
    
    // Wait for update to complete with more retries
    let updatedTask: any
    let updateRetries = 0
    const maxUpdateRetries = 30 // Increased retries
    while (updateRetries < maxUpdateRetries) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.status === 'in_progress') break
      await new Promise(resolve => setTimeout(resolve, 200)) // Longer wait
      updateRetries++
    }
    
    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.status).toBe('in_progress')
    expect(updatedTask.data?.updatedAt).toBeDefined()
  }, 60000) // Increase test timeout to 60 seconds

  it('should update task status from in_progress to completed', async () => {
    const taskId = await createTaskEmu({ title: 'Complete Test Task', status: 'in_progress', priority: 5 })
    
    // Additional wait after createTaskEmu returns
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Wait and retry until task exists and is readable (emulator may have slight delay)
    let task: any
    let retries = 0
    const maxRetries = 40
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(taskId)
      if (task.exists && task.data && task.data.status === 'in_progress') break
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    if (!task.exists) {
      throw new Error(`Task ${taskId} was not found after ${maxRetries} retries`)
    }
    
    expect(task.exists).toBe(true)
    expect(task.data?.status).toBe('in_progress')
    
    // Additional delay before update
    await new Promise(resolve => setTimeout(resolve, 200))
    
    await updateTaskStatusEmu(taskId, 'completed')
    
    // Wait for update to complete with more retries
    let updatedTask: any
    let updateRetries = 0
    const maxUpdateRetries = 30
    while (updateRetries < maxUpdateRetries) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.status === 'completed') break
      await new Promise(resolve => setTimeout(resolve, 200))
      updateRetries++
    }
    
    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.status).toBe('completed')
  }, 60000) // Increase test timeout to 60 seconds

  it('should update last updated timestamp when status changes', async () => {
    const taskId = await createTaskEmu({ title: 'Timestamp Test', status: 'todo', priority: 5 })
    
    // Wait and retry until task exists and is readable (emulator may have slight delay)
    let beforeUpdate: any
    let retries = 0
    const maxRetries = 30
    while (retries < maxRetries) {
      beforeUpdate = await getTaskByIdEmu(taskId)
      if (beforeUpdate.exists && beforeUpdate.data && beforeUpdate.data.updatedAt) break
      await new Promise(resolve => setTimeout(resolve, 150))
      retries++
    }
    
    if (!beforeUpdate.exists) {
      throw new Error(`Task ${taskId} was not found after ${maxRetries} retries`)
    }
    
    expect(beforeUpdate.exists).toBe(true)
    const originalUpdatedAt = beforeUpdate.data?.updatedAt
    expect(originalUpdatedAt).toBeDefined()
    
    // Wait a moment to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Update task status
    await updateTaskStatusEmu(taskId, 'in_progress')
    
    // Wait and retry until task is updated
    let afterUpdate: any
    let updateRetries = 0
    const maxUpdateRetries = 25
    while (updateRetries < maxUpdateRetries) {
      afterUpdate = await getTaskByIdEmu(taskId)
      if (afterUpdate.exists && 
          afterUpdate.data?.updatedAt && 
          afterUpdate.data?.updatedAt !== originalUpdatedAt &&
          afterUpdate.data?.status === 'in_progress') break
      await new Promise(resolve => setTimeout(resolve, 150))
      updateRetries++
    }
    
    expect(afterUpdate.exists).toBe(true)
    expect(afterUpdate.data?.updatedAt).toBeDefined()
    expect(afterUpdate.data?.updatedAt).not.toBe(originalUpdatedAt)
    expect(new Date(afterUpdate.data?.updatedAt).getTime()).toBeGreaterThan(
      new Date(originalUpdatedAt).getTime()
    )
  }, 45000) // Increase test timeout

  it('should allow transition from any status to cancelled', async () => {
    const taskId = await createTaskEmu({ title: 'Cancel Test', status: 'in_progress', priority: 5 })
    
    // Wait and retry until task exists
    let task: any
    let retries = 0
    const maxRetries = 30
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(taskId)
      if (task.exists && task.data && task.data.status) break
      await new Promise(resolve => setTimeout(resolve, 150))
      retries++
    }
    
    expect(task.exists).toBe(true)
    expect(task.data?.status).toBe('in_progress')
    
    // Small delay before update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await updateTaskStatusEmu(taskId, 'cancelled')
    
    // Wait for update to complete
    let updatedTask: any
    let updateRetries = 0
    const maxUpdateRetries = 20
    while (updateRetries < maxUpdateRetries) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.status === 'cancelled') break
      await new Promise(resolve => setTimeout(resolve, 150))
      updateRetries++
    }
    
    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.status).toBe('cancelled')
  }, 30000) // Increase test timeout
})
