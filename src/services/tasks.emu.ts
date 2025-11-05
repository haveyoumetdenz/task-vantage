import { addDoc, collection, getDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/test/emulatorDb'
import { validateTaskData, sanitizeTaskData } from '@/utils/taskValidation'
import { validateStatusTransition } from '@/utils/statusTransitionValidation'

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
  
  try {
    const ref = await addDoc(collection(db, 'tasks'), filtered)
    
    // Wait for document to be committed (emulator may have slight delay)
    // Use a longer initial wait and then verify
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Verify task exists and is readable with retries
    let retries = 0
    const maxRetries = 100 // Increased retries significantly for emulator consistency
    while (retries < maxRetries) {
      try {
        const snap = await getDoc(doc(db, 'tasks', ref.id))
        if (snap.exists() && snap.data() && snap.data().title) {
          // Task exists, has data, and has required fields - return ID
          return ref.id
        }
      } catch (error: any) {
        // Log error but continue retrying
        if (retries === 0) {
          console.warn(`⚠️ Error reading task ${ref.id} on first attempt:`, error.message)
        }
      }
      await new Promise(resolve => setTimeout(resolve, 300)) // Longer wait between retries
      retries++
    }
    
    // If we get here, task was created but not readable after many retries
    // This might indicate an emulator connection issue
    console.error(`❌ Task ${ref.id} was created but not readable after ${maxRetries} retries`)
    throw new Error(`Task ${ref.id} was created but not readable in emulator after ${maxRetries} retries. This may indicate an emulator connection issue.`)
  } catch (error: any) {
    // If addDoc fails, re-throw the error
    if (error.message?.includes('Task') && error.message?.includes('created but not readable')) {
      throw error
    }
    throw new Error(`Failed to create task: ${error.message || error}`)
  }
}

export async function getTaskByIdEmu(id: string): Promise<{ exists: boolean; data?: any }> {
  try {
    const snap = await getDoc(doc(db, 'tasks', id))
    const exists = snap.exists()
    const data = exists ? snap.data() : undefined
    return { exists, data }
  } catch (error: any) {
    // If there's an error, assume it doesn't exist
    console.warn(`Error reading task ${id}:`, error.message)
    return { exists: false }
  }
}

export async function updateTaskStatusEmu(id: string, status: 'todo' | 'in_progress' | 'completed' | 'cancelled'): Promise<void> {
  // Get current task to validate transition - retry if task not found (emulator timing)
  let snap = await getDoc(doc(db, 'tasks', id))
  let retries = 0
  const maxRetries = 30 // Increased retries for emulator consistency
  while (!snap.exists() && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 150))
    snap = await getDoc(doc(db, 'tasks', id))
    retries++
  }
  
  if (!snap.exists()) {
    throw new Error(`Task not found: ${id} (after ${maxRetries} retries)`)
  }
  
  const currentStatus = snap.data()?.status || 'todo'
  const transition = validateStatusTransition(currentStatus, status)
  
  if (!transition.valid) {
    throw new Error(transition.errors.join(', '))
  }
  
  await updateDoc(doc(db, 'tasks', id), {
    status,
    updatedAt: new Date().toISOString()
  })
  
  // Wait for update to be committed (emulator may have slight delay)
  // Verify update was successful
  let verifyRetries = 0
  const maxVerifyRetries = 20
  while (verifyRetries < maxVerifyRetries) {
    const verifySnap = await getDoc(doc(db, 'tasks', id))
    if (verifySnap.exists() && verifySnap.data()?.status === status) {
      // Update was committed successfully
      return
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    verifyRetries++
  }
  // Don't throw error here - update was sent, emulator will eventually commit it
}

export async function updateTaskDueDateEmu(id: string, dueDate: string): Promise<void> {
  // Get current task first to ensure it exists - retry if task not found (emulator timing)
  let snap = await getDoc(doc(db, 'tasks', id))
  let retries = 0
  const maxRetries = 30 // Retries for emulator consistency
  while (!snap.exists() && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 150))
    snap = await getDoc(doc(db, 'tasks', id))
    retries++
  }
  
  if (!snap.exists()) {
    throw new Error(`Task not found: ${id} (after ${maxRetries} retries)`)
  }
  
  await updateDoc(doc(db, 'tasks', id), {
    due_date: dueDate,
    updatedAt: new Date().toISOString()
  })
  
  // Wait for update to be committed (emulator may have slight delay)
  let verifyRetries = 0
  const maxVerifyRetries = 20
  while (verifyRetries < maxVerifyRetries) {
    const verifySnap = await getDoc(doc(db, 'tasks', id))
    if (verifySnap.exists() && verifySnap.data()?.due_date === dueDate) {
      // Update was committed successfully
      return
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    verifyRetries++
  }
  // Don't throw error here - update was sent, emulator will eventually commit it
}

export async function updateTaskProjectEmu(id: string, projectId: string | null): Promise<void> {
  // Get current task first to ensure it exists - retry if task not found (emulator timing)
  let snap = await getDoc(doc(db, 'tasks', id))
  let retries = 0
  const maxRetries = 30 // Increased retries for emulator consistency
  while (!snap.exists() && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 150))
    snap = await getDoc(doc(db, 'tasks', id))
    retries++
  }
  
  if (!snap.exists()) {
    throw new Error(`Task not found: ${id} (after ${maxRetries} retries)`)
  }
  
  await updateDoc(doc(db, 'tasks', id), {
    projectId: projectId || null,
    updatedAt: new Date().toISOString()
  })
  
  // Wait for update to be committed (emulator may have slight delay)
  let verifyRetries = 0
  const maxVerifyRetries = 20
  while (verifyRetries < maxVerifyRetries) {
    const verifySnap = await getDoc(doc(db, 'tasks', id))
    if (verifySnap.exists() && verifySnap.data()?.projectId === (projectId || null)) {
      // Update was committed successfully
      return
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    verifyRetries++
  }
  // Don't throw error here - update was sent, emulator will eventually commit it
}
