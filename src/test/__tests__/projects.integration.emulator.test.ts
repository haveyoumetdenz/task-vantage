import { describe, it, expect, beforeAll } from 'vitest'
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createProjectEmu, getProjectByIdEmu } from '@/services/projects.emu'
import { calculateProjectProgress, type Task } from '@/utils/projectValidation'

async function clearAll() {
  await clearCollection('projects')
  await clearCollection('tasks')
}

describe('TGO-COR-01 Create Project (Firestore Emulator)', () => {
  beforeAll(async () => {
    await clearAll()
  })

  it('creates a project and can read it back', async () => {
    const id = await createProjectEmu({ title: 'Emu Project' })
    const { exists, data } = await getProjectByIdEmu(id)
    expect(exists).toBe(true)
    expect(data?.title).toBe('Emu Project')
    expect(data?.status).toBe('active')

    const all = await getDocs(collection(db, 'projects'))
    const ids = all.docs.map((d) => d.id)
    expect(ids).toContain(id)
  })

  it('updates progress with tasks (50% then 100%)', async () => {
    const projectId = await createProjectEmu({ title: 'Progress Project' })

    // add 2 tasks into the project (1 completed, 1 todo)
    await addDoc(collection(db, 'tasks'), { title: 'T1', status: 'completed', priority: 5, projectId })
    await addDoc(collection(db, 'tasks'), { title: 'T2', status: 'todo', priority: 5, projectId })

    // fetch tasks for calculation
    const snap1 = await getDocs(collection(db, 'tasks'))
    const tasks1: Task[] = snap1.docs
      .map((d) => d.data())
      .filter((t: any) => t.projectId === projectId) as Task[]

    const p1 = calculateProjectProgress(tasks1)
    expect(p1).toBe(50)

    // update the todo task to completed
    const qTodo = query(collection(db, 'tasks'), where('projectId', '==', projectId), where('status', '==', 'todo'))
    const todoSnap = await getDocs(qTodo)
    for (const dRef of todoSnap.docs) {
      await updateDoc(doc(db, 'tasks', dRef.id), { status: 'completed' })
    }

    const snap2 = await getDocs(collection(db, 'tasks'))
    const tasks2: Task[] = snap2.docs
      .map((d) => d.data())
      .filter((t: any) => t.projectId === projectId) as Task[]

    const p2 = calculateProjectProgress(tasks2)
    expect(p2).toBe(100)
  })
})
