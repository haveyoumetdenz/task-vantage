import { addDoc, collection, getDoc, doc } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateTaskData, sanitizeTaskData } from '@/utils/taskValidation'

export async function createTaskEmu(data: any): Promise<string> {
  const v = validateTaskData(data)
  if (!v.valid) throw new Error(v.errors.join(', '))
  const sanitized = sanitizeTaskData(data)
  const toSave = {
    ...sanitized,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  // Filter out undefined fields (Firestore rejects undefined values)
  const filtered = Object.fromEntries(Object.entries(toSave).filter(([_, val]) => val !== undefined))
  const ref = await addDoc(collection(db, 'tasks'), filtered)
  return ref.id
}

export async function getTaskByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'tasks', id))
  return { exists: snap.exists(), data: snap.data() }
}
