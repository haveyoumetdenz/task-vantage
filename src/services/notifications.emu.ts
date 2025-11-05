import { addDoc, collection, getDoc, doc } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateNotificationData } from '@/utils/notificationValidation'

export async function createNotificationEmu(data: {
  userId: string
  type: string
  title: string
  message: string
  entityType?: string
  entityId?: string
}): Promise<string> {
  const v = validateNotificationData(data)
  if (!v.valid) throw new Error(v.errors.join(', '))
  
  const toSave = {
    ...data,
    read: false,
    timestamp: new Date().toISOString(),
  }
  
  // Filter out undefined values
  const filtered = Object.fromEntries(
    Object.entries(toSave).filter(([_, val]) => val !== undefined)
  )
  
  const ref = await addDoc(collection(db, 'notifications'), filtered)
  return ref.id
}

export async function getNotificationByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'notifications', id))
  return { exists: snap.exists(), data: snap.data() }
}

