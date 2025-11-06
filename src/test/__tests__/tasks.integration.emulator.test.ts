import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { getDocs, collection } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createTaskEmu, getTaskByIdEmu } from '@/services/tasks.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearTasks() {
  await clearCollection('tasks')
}

describe('TM-COR-01 Create Task (Firestore Emulator)', () => {
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
    // Wait a bit longer to ensure test operations are complete
    await new Promise(resolve => setTimeout(resolve, 200))
    await clearTasks()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterAll(async () => {
    // Final cleanup after all tests
    await clearTasks()
  })

  it('creates a valid task and can read it back', async () => {
    const id = await createTaskEmu({ title: 'Emu Task', priority: 5 })
    
    // createTaskEmu now uses waitForPendingWrites, so task should be immediately readable
    // But add a small delay and retry just in case
    let task: any
    let retries = 0
    const maxRetries = 10 // Reduced retries since waitForPendingWrites should handle it
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(id)
      if (task.exists && task.data && task.data.title) {
        break
      }
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    if (!task || !task.exists) {
      throw new Error(`Task ${id} was not found after ${maxRetries} retries. This may indicate an emulator connection issue.`)
    }
    
    expect(task.exists).toBe(true)
    expect(task.data?.title).toBe('Emu Task')
    expect(task.data?.status).toBe('todo')
    expect(task.data?.priority).toBe(5)
  }, 60000)

  it('rejects invalid task (empty title)', async () => {
    await expect(createTaskEmu({ title: '', priority: 5 })).rejects.toThrow()
  })
})
