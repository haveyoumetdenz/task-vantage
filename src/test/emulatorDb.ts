import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, collection, getDocs, deleteDoc, doc, Firestore } from 'firebase/firestore'

let app: FirebaseApp | undefined = getApps()[0]
if (!app) {
  // Use same project ID as emulator (must match --project flag)
  app = initializeApp({ projectId: 'task-vantage-test' })
}

// Get Firestore instance
const db = getFirestore(app)

// Connect to Firestore Emulator
// IMPORTANT: connectFirestoreEmulator MUST be called BEFORE any Firestore operations
// and MUST be called even if FIRESTORE_EMULATOR_HOST is set (to ensure proper connection)
try {
  // Always connect explicitly - this ensures proper emulator connection
  // The emulator host env var is used by the test script, but we still need to connect
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
} catch (error: any) {
  // If already connected, that's fine - ignore the error
  if (error.message?.includes('already been called')) {
    // Already connected, that's fine
  } else {
    console.warn('⚠️  Firestore Emulator connection issue:', error.message)
    console.warn('💡 Make sure Firestore Emulator is running: npm run emulator:start')
  }
}

export { db }

export async function clearCollection(path: string): Promise<void> {
  try {
    // Use batch deletion to handle large collections efficiently
    // Limit query to avoid RESOURCE_EXHAUSTED errors
    const snap = await getDocs(collection(db, path))
    
    // Delete in smaller batches to avoid RESOURCE_EXHAUSTED errors
    const batchSize = 100 // Reduced batch size
    const docs = snap.docs
    
    // Delete in sequential batches to avoid overwhelming the emulator
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize)
      await Promise.all(batch.map((d) => deleteDoc(doc(db, path, d.id))))
      // Small delay between batches to avoid overwhelming emulator
      if (i + batchSize < docs.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    // Wait a bit for deletions to complete
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error: any) {
    // If collection doesn't exist or is empty, that's fine
    if (error.message?.includes('RESOURCE_EXHAUSTED')) {
      // Collection too large - try to delete all by iterating with limit
      console.warn(`Collection ${path} is too large, attempting limited deletion...`)
      try {
        // Try to delete documents one by one with a limit
        const limitedSnap = await getDocs(collection(db, path))
        const limit = 1000 // Limit to first 1000 docs
        const docsToDelete = limitedSnap.docs.slice(0, limit)
        for (const d of docsToDelete) {
          try {
            await deleteDoc(doc(db, path, d.id))
          } catch (e) {
            // Ignore individual delete errors
          }
        }
      } catch (e) {
        console.warn(`Could not clear collection ${path} due to size:`, error.message)
      }
    } else if (!error.message?.includes('PERMISSION_DENIED')) {
      console.warn(`Warning: Could not clear collection ${path}:`, error.message)
    }
  }
}

export async function teardownEmulatorApp(): Promise<void> {
  try {
    if (app) {
      await deleteApp(app)
    }
  } catch {
    // ignore
  }
}

