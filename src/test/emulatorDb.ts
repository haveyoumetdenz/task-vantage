import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, collection, getDocs, deleteDoc, doc, Firestore } from 'firebase/firestore'

let app: FirebaseApp | undefined = getApps()[0]
if (!app) {
  app = initializeApp({ projectId: 'demo-task-vantage' })
}

export const db: Firestore = getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)

export async function clearCollection(path: string): Promise<void> {
  const snap = await getDocs(collection(db, path))
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, path, d.id))))
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

