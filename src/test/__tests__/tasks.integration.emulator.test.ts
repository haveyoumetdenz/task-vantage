import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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
    await clearTasks()
  })

  afterAll(async () => {
    await clearTasks()
  })

  it('creates a valid task and can read it back', async () => {
    const id = await createTaskEmu({ title: 'Emu Task', priority: 5 })
    
    // Wait a bit for emulator to commit
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Wait and retry until task is readable (emulator timing)
    let task: any
    let retries = 0
    const maxRetries = 50 // Increased retries
    while (retries < maxRetries) {
      task = await getTaskByIdEmu(id)
      if (task.exists && task.data && task.data.title) {
        // Task found and readable
        break
      }
      await new Promise(resolve => setTimeout(resolve, 200)) // Longer wait
      retries++
    }
    
    if (!task || !task.exists) {
      throw new Error(`Task ${id} was not found after ${maxRetries} retries. This may indicate an emulator connection issue.`)
    }
    
    expect(task.exists).toBe(true)
    expect(task.data?.title).toBe('Emu Task')
    expect(task.data?.status).toBe('todo')
    expect(task.data?.priority).toBe(5)
    
    // Verify task exists by reading it back (no need to query all tasks)
    // This avoids RESOURCE_EXHAUSTED errors when collection is large
  }, 60000) // Increase timeout to 60 seconds

  it('rejects invalid task (empty title)', async () => {
    await expect(createTaskEmu({ title: '', priority: 5 })).rejects.toThrow()
  })
})
