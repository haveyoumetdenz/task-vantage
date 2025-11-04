import { addDoc, collection, getDoc, doc } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateProjectData } from '@/utils/projectValidation'

export async function createProjectEmu(data: any): Promise<string> {
  const v = validateProjectData(data)
  if (!v.valid) throw new Error(v.errors.join(', '))
  const toSave = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: data.status || 'active',
  }
  const ref = await addDoc(collection(db, 'projects'), toSave)
  return ref.id
}

export async function getProjectByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'projects', id))
  return { exists: snap.exists(), data: snap.data() }
}

