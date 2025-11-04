import { describe, it, expect, beforeAll } from 'vitest'
import { getDocs, collection } from 'firebase/firestore'
import { clearCollection } from '@/test/emulatorDb'
import { createRecurringTemplateEmu, materializeInstancesFromConfigEmu } from '@/services/recurrence.emu'
import { db } from '@/test/emulatorDb'

async function clearAll() {
  await clearCollection('tasks')
  await clearCollection('task_instances')
}

describe('TM-COR-05 Task Recurrence (Firestore Emulator)', () => {
  beforeAll(async () => {
    await clearAll()
  })

  it('creates template and materializes 3 daily instances (after=3)', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // tomorrow
    const templateId = await createRecurringTemplateEmu(
      { title: 'Recurring Daily', priority: 5 },
      { frequency: 'daily', interval: 1, endCondition: 'after', endValue: 3, startDate: start }
    )

    const count = await materializeInstancesFromConfigEmu(templateId, {
      frequency: 'daily', interval: 1, endCondition: 'after', endValue: 3, startDate: start
    })
    expect(count).toBe(3)

    const snap = await getDocs(collection(db, 'task_instances'))
    expect(snap.docs.length).toBe(3)
  })

  it('rejects invalid recurrence (interval=0)', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await expect(createRecurringTemplateEmu(
      { title: 'Bad Recurrence', priority: 5 },
      { frequency: 'daily', interval: 0, endCondition: 'after', endValue: 3, startDate: start }
    )).rejects.toThrow()
  })
})
