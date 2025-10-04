import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Subtask {
  id: string
  taskId: string
  title: string
  status: 'open' | 'in_progress' | 'done'
  createdAt: string
  updatedAt: string
  userId: string
  creator_profile?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface CreateSubtaskData {
  title: string
  status?: 'open' | 'in_progress' | 'done'
}

export interface UpdateSubtaskData {
  id: string
  title?: string
  status?: 'open' | 'in_progress' | 'done'
}

export const useFirebaseSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !taskId) {
      setSubtasks([])
      setLoading(false)
      return
    }

    const subtasksRef = collection(db, 'subtasks')
    const q = query(
      subtasksRef,
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subtasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subtask[]
      setSubtasks(subtasksData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching subtasks:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, taskId])

  const createSubtask = async (subtaskData: CreateSubtaskData) => {
    if (!user) return null

    try {
      const subtaskDoc = {
        taskId,
        title: subtaskData.title,
        status: subtaskData.status || 'open',
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator_profile: {
          full_name: user.displayName || user.email || 'User',
          avatar_url: user.photoURL || null
        }
      }

      const docRef = await addDoc(collection(db, 'subtasks'), subtaskDoc)
      
      toast({
        title: 'Success',
        description: 'Subtask created successfully',
      })

      return { id: docRef.id, ...subtaskDoc }
    } catch (error: any) {
      console.error('Create subtask error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create subtask',
        variant: 'destructive',
      })
      return null
    }
  }

  const updateSubtask = async (subtaskData: UpdateSubtaskData) => {
    if (!user) return null

    try {
      const { id, ...updateData } = subtaskData
      const subtaskRef = doc(db, 'subtasks', id)
      
      // Filter out undefined values to avoid Firestore errors
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      await updateDoc(subtaskRef, {
        ...filteredUpdateData,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: 'Success',
        description: 'Subtask updated successfully',
      })

      return true
    } catch (error: any) {
      console.error('Update subtask error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update subtask',
        variant: 'destructive',
      })
      return null
    }
  }

  const deleteSubtask = async (subtaskId: string) => {
    if (!user) return null

    try {
      await deleteDoc(doc(db, 'subtasks', subtaskId))
      
      toast({
        title: 'Success',
        description: 'Subtask deleted successfully',
      })

      return true
    } catch (error: any) {
      console.error('Delete subtask error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete subtask',
        variant: 'destructive',
      })
      return null
    }
  }

  return {
    subtasks,
    loading,
    createSubtask,
    updateSubtask,
    deleteSubtask
  }
}
