import { addDoc, collection, getDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateSubtaskData, sanitizeSubtaskData } from '@/utils/subtaskValidation'

export async function createSubtaskEmu(data: {
  taskId: string
  title: string
  status?: 'open' | 'in_progress' | 'done'
  assigneeId?: string
  userId?: string
}): Promise<string> {
  const v = validateSubtaskData(data)
  if (!v.valid) throw new Error(v.errors.join(', '))
  
  const sanitized = sanitizeSubtaskData(data)
  const toSave = {
    ...sanitized,
    userId: data.userId || 'test-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Filter out undefined values
  const filtered = Object.fromEntries(
    Object.entries(toSave).filter(([_, val]) => val !== undefined)
  )
  
  const ref = await addDoc(collection(db, 'subtasks'), filtered)
  return ref.id
}

export async function getSubtaskByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'subtasks', id))
  return { exists: snap.exists(), data: snap.data() }
}

export async function updateSubtaskStatusEmu(id: string, status: 'open' | 'in_progress' | 'done'): Promise<void> {
  await updateDoc(doc(db, 'subtasks', id), {
    status,
    updatedAt: new Date().toISOString()
  })
}

