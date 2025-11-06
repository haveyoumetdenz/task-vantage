import { addDoc, collection, getDoc, doc, updateDoc, waitForPendingWrites } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateProjectData, sanitizeProjectData, calculateProjectProgress } from '@/utils/projectValidation'

export async function createProjectEmu(data: any): Promise<string> {
  const v = validateProjectData(data)
  if (!v.valid) throw new Error(v.errors.join(', '))
  const sanitized = sanitizeProjectData(data)
  const toSave = {
    ...sanitized,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: sanitized.status || 'active',
  }
  // Filter out undefined fields (Firestore rejects undefined values)
  const filtered = Object.fromEntries(Object.entries(toSave).filter(([_, val]) => val !== undefined))
  const ref = await addDoc(collection(db, 'projects'), filtered)
  
  // Wait for pending writes to be committed (ensures emulator consistency)
  try {
    await waitForPendingWrites(db)
  } catch (error: any) {
    // If waitForPendingWrites fails, wait a bit manually
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  return ref.id
}

export async function updateProjectProgressEmu(projectId: string, tasks: any[]): Promise<number> {
  const progress = calculateProjectProgress(tasks)
  await updateDoc(doc(db, 'projects', projectId), { progress })
  
  // Wait for pending writes to be committed (ensures emulator consistency)
  try {
    await waitForPendingWrites(db)
  } catch (error: any) {
    // If waitForPendingWrites fails, wait a bit manually
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  return progress
}

export async function getProjectByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'projects', id))
  return { exists: snap.exists(), data: snap.data() }
}

