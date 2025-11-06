import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createSubtaskEmu, getSubtaskByIdEmu, updateSubtaskStatusEmu } from '@/services/subtasks.emu'
import { createTaskEmu } from '@/services/tasks.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearAll() {
  await clearCollection('tasks')
  await clearCollection('subtasks')
}

describe('TGO-COR-04: Create Subtasks (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    await clearAll()
  })

  beforeEach(async () => {
    // Clear all data before each test to ensure isolation
    await clearAll()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(async () => {
    // Clean up after each test to ensure no data leaks
    await clearAll()
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterAll(async () => {
    // Final cleanup after all tests
    await clearAll()
  })

  it('should create a subtask and link it to a task', async () => {
    const taskId = await createTaskEmu({ title: 'Parent Task', priority: 5 })
    
    const subtaskId = await createSubtaskEmu({
      taskId,
      title: 'Subtask 1',
      status: 'open',
      userId: 'test-user'
    })
    
    const subtask = await getSubtaskByIdEmu(subtaskId)
    expect(subtask.exists).toBe(true)
    expect(subtask.data?.title).toBe('Subtask 1')
    expect(subtask.data?.taskId).toBe(taskId)
    expect(subtask.data?.status).toBe('open')
  })

  it('should default to open status when not specified', async () => {
    const taskId = await createTaskEmu({ title: 'Parent Task 2', priority: 5 })
    
    const subtaskId = await createSubtaskEmu({
      taskId,
      title: 'Subtask 2',
      userId: 'test-user'
    })
    
    const subtask = await getSubtaskByIdEmu(subtaskId)
    expect(subtask.data?.status).toBe('open')
  })

  it('should update subtask status to done', async () => {
    const taskId = await createTaskEmu({ title: 'Parent Task 3', priority: 5 })
    
    const subtaskId = await createSubtaskEmu({
      taskId,
      title: 'Subtask 3',
      status: 'open',
      userId: 'test-user'
    })
    
    await updateSubtaskStatusEmu(subtaskId, 'done')
    
    const subtask = await getSubtaskByIdEmu(subtaskId)
    expect(subtask.data?.status).toBe('done')
  })

  it('should reject empty subtask title', async () => {
    const taskId = await createTaskEmu({ title: 'Parent Task 4', priority: 5 })
    
    await expect(
      createSubtaskEmu({
        taskId,
        title: '',
        userId: 'test-user'
      })
    ).rejects.toThrow('Subtask title is required')
  })

  it('should query subtasks by taskId', async () => {
    const taskId = await createTaskEmu({ title: 'Parent Task 5', priority: 5 })
    
    await createSubtaskEmu({ taskId, title: 'Subtask A', userId: 'test-user' })
    await createSubtaskEmu({ taskId, title: 'Subtask B', userId: 'test-user' })
    
    const q = query(collection(db, 'subtasks'), where('taskId', '==', taskId))
    const snap = await getDocs(q)
    
    expect(snap.docs.length).toBe(2)
    expect(snap.docs.map(d => d.data().title)).toContain('Subtask A')
    expect(snap.docs.map(d => d.data().title)).toContain('Subtask B')
  })
})

