import { addDoc, collection, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateCommentData } from '@/utils/commentValidation'
import { serverTimestamp } from 'firebase/firestore'

export interface ActivityData {
  entityType: 'task' | 'project' | 'subtask'
  entityId: string
  type: 'comment' | 'status_change' | 'assignment' | 'creation' | 'completion'
  userId: string
  userName: string
  content: string
  mentions?: string[]
  metadata?: {
    oldValue?: string
    newValue?: string
    field?: string
  }
}

export async function createActivityEmu(data: ActivityData): Promise<string> {
  // Validate comment data if it's a comment
  if (data.type === 'comment') {
    const validation = validateCommentData({
      content: data.content,
      taskId: data.entityType === 'task' ? data.entityId : undefined,
      userId: data.userId
    })
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }
  }

  const activityData = {
    ...data,
    timestamp: serverTimestamp()
  }

  // Filter out undefined values
  const filtered = Object.fromEntries(
    Object.entries(activityData).filter(([_, val]) => val !== undefined)
  )

  const ref = await addDoc(collection(db, 'activities'), filtered)
  
  // Wait for document to be committed
  let retries = 0
  while (retries < 10) {
    const snap = await getDoc(doc(db, 'activities', ref.id))
    if (snap.exists()) break
    await new Promise(resolve => setTimeout(resolve, 100))
    retries++
  }
  
  return ref.id
}

export async function getActivityByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  const snap = await getDoc(doc(db, 'activities', id))
  return { exists: snap.exists(), data: snap.data() }
}

export async function getActivitiesByEntityEmu(
  entityType: 'task' | 'project' | 'subtask',
  entityId: string
): Promise<any[]> {
  const q = query(
    collection(db, 'activities'),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('timestamp', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date()
  }))
}

export async function updateActivityEmu(id: string, updates: Partial<ActivityData>): Promise<void> {
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([_, val]) => val !== undefined)
  )
  
  await updateDoc(doc(db, 'activities', id), {
    ...filtered,
    updatedAt: serverTimestamp()
  })
}

export async function deleteActivityEmu(id: string): Promise<void> {
  await deleteDoc(doc(db, 'activities', id))
}

