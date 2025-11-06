import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { collection, getDocs, addDoc, updateDoc, doc, query, where, getDoc } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createProjectEmu, getProjectByIdEmu } from '@/services/projects.emu'
import { calculateProjectProgress, type Task } from '@/utils/projectValidation'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'

async function clearAll() {
  await clearCollection('projects')
  await clearCollection('tasks')
}

describe('TGO-COR-01 Create Project (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    // Clear collections with longer timeout to handle large datasets
    await clearAll()
  }, 30000) // Increase timeout to 30 seconds for clearing collections

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

  it('creates a project and can read it back', async () => {
    const id = await createProjectEmu({ title: 'Emu Project' })
    const { exists, data } = await getProjectByIdEmu(id)
    expect(exists).toBe(true)
    expect(data?.title).toBe('Emu Project')
    expect(data?.status).toBe('active')
    
    // Verify project exists by reading it back (no need to query all projects)
    // This avoids RESOURCE_EXHAUSTED errors when collection is large
  })

  it('updates progress with tasks (50% then 100%)', async () => {
    // Clear tasks first to ensure clean state
    await clearCollection('tasks')
    
    const projectId = await createProjectEmu({ title: 'Progress Project' })

    // add 2 tasks into the project (1 completed, 1 todo)
    const task1Ref = await addDoc(collection(db, 'tasks'), { 
      title: 'T1', 
      status: 'completed', 
      priority: 5, 
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const task2Ref = await addDoc(collection(db, 'tasks'), { 
      title: 'T2', 
      status: 'todo', 
      priority: 5, 
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Wait for tasks to be committed with longer waits
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify both tasks exist before querying
    let task1Exists = false
    let task2Exists = false
    let verifyRetries = 0
    while ((!task1Exists || !task2Exists) && verifyRetries < 30) {
      const task1Snap = await getDoc(doc(db, 'tasks', task1Ref.id))
      const task2Snap = await getDoc(doc(db, 'tasks', task2Ref.id))
      task1Exists = task1Snap.exists()
      task2Exists = task2Snap.exists()
      if (task1Exists && task2Exists) break
      await new Promise(resolve => setTimeout(resolve, 200))
      verifyRetries++
    }

    if (!task1Exists || !task2Exists) {
      throw new Error(`Tasks not found after creation: task1=${task1Exists}, task2=${task2Exists}`)
    }

    // fetch tasks for calculation with more retries
    let tasks1: Task[] = []
    let retries = 0
    while (retries < 30) {
      const q1 = query(collection(db, 'tasks'), where('projectId', '==', projectId))
      const snap1 = await getDocs(q1)
      tasks1 = snap1.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
      if (tasks1.length === 2) break
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }

    expect(tasks1.length).toBe(2)
    const p1 = calculateProjectProgress(tasks1)
    expect(p1).toBe(50)

    // update the todo task to completed
    await updateDoc(doc(db, 'tasks', task2Ref.id), { 
      status: 'completed',
      updatedAt: new Date().toISOString()
    })

    // Wait for update to be committed (emulator may have slight delay)
    await new Promise(resolve => setTimeout(resolve, 300))

    // Retry query until both tasks show as completed with more retries
    let tasks2: Task[] = []
    let retries2 = 0
    while (retries2 < 30) {
      const q2 = query(collection(db, 'tasks'), where('projectId', '==', projectId))
      const snap2 = await getDocs(q2)
      tasks2 = snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
      
      const completedCount = tasks2.filter(t => t.status === 'completed').length
      if (tasks2.length === 2 && completedCount === 2) break
      
      await new Promise(resolve => setTimeout(resolve, 200))
      retries2++
    }

    const p2 = calculateProjectProgress(tasks2)
    // Verify we have 2 tasks and both are completed
    expect(tasks2.length).toBe(2)
    expect(tasks2.filter(t => t.status === 'completed').length).toBe(2)
    expect(p2).toBe(100)
  }, 30000) // Increase timeout for this test
})
