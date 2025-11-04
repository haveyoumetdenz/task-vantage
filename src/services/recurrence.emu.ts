import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateRecurrenceConfig, generateRecurringDates, type RecurrenceConfig } from '@/utils/recurrenceValidation'
import { validateTaskData, sanitizeTaskData } from '@/utils/taskValidation'

export async function createRecurringTemplateEmu(taskData: any, recurrence: RecurrenceConfig): Promise<string> {
  const vt = validateTaskData(taskData)
  if (!vt.valid) throw new Error(vt.errors.join(', '))

  const vr = validateRecurrenceConfig(recurrence)
  if (!vr.valid) throw new Error(vr.errors.join(', '))

  const sanitized = sanitizeTaskData(taskData)
  const toSave = {
    ...sanitized,
    isRecurring: true,
    recurrence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  // Filter out undefined fields (Firestore rejects undefined values)
  const filtered = Object.fromEntries(Object.entries(toSave).filter(([_, val]) => val !== undefined))
  const ref = await addDoc(collection(db, 'tasks'), filtered)
  return ref.id
}

export async function materializeInstancesEmu(templateId: string): Promise<number> {
  const q = query(collection(db, 'tasks'), where('id', '==', templateId))
  return 0
}

export async function materializeInstancesFromConfigEmu(templateId: string, recurrence: RecurrenceConfig): Promise<number> {
  const dates = generateRecurringDates(recurrence, 100)
  for (const dueDate of dates) {
    await addDoc(collection(db, 'task_instances'), {
      templateId,
      dueDate,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return dates.length
}
