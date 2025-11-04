import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getDocs, collection } from 'firebase/firestore'
import { db, clearCollection } from '@/test/emulatorDb'
import { createTaskEmu, getTaskByIdEmu } from '@/services/tasks.emu'

async function clearTasks() {
  await clearCollection('tasks')
}

describe('TM-COR-01 Create Task (Firestore Emulator)', () => {
  beforeAll(async () => {
    await clearTasks()
  })

  afterAll(async () => {
    await clearTasks()
  })

  it('creates a valid task and can read it back', async () => {
    const id = await createTaskEmu({ title: 'Emu Task', priority: 5 })
    const { exists, data } = await getTaskByIdEmu(id)
    expect(exists).toBe(true)
    expect(data?.title).toBe('Emu Task')
    expect(data?.status).toBe('todo')
    expect(data?.priority).toBe(5)

    const all = await getDocs(collection(db, 'tasks'))
    const ids = all.docs.map((d) => d.id)
    expect(ids).toContain(id)
  })

  it('rejects invalid task (empty title)', async () => {
    await expect(createTaskEmu({ title: '', priority: 5 })).rejects.toThrow()
  })
})
