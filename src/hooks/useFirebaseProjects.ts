import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Project {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'on_hold' | 'archived'
  progress: number
  dueDate?: string
  userId: string
  teamId?: string
  assigneeIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProjectData {
  title: string
  description?: string
  status?: 'active' | 'completed' | 'on_hold' | 'archived'
  progress?: number
  dueDate?: string
  teamId?: string
  assigneeIds?: string[]
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string
}

export const useFirebaseProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    // Create query for projects
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]
      setProjects(projectsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const createProject = async (projectData: CreateProjectData) => {
    if (!user) return null

    try {
      // Filter out undefined values to avoid Firestore errors
      const filteredProjectData = Object.fromEntries(
        Object.entries(projectData).filter(([_, value]) => value !== undefined)
      )

      const projectDoc = {
        ...filteredProjectData,
        userId: user.uid,
        status: projectData.status || 'active',
        progress: projectData.progress || 0,
        assigneeIds: projectData.assigneeIds || [user.uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'projects'), projectDoc)
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      })

      return { id: docRef.id, ...projectDoc }
    } catch (error: any) {
      console.error('Create project error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      })
      return null
    }
  }

  const updateProject = async (projectData: UpdateProjectData) => {
    if (!user) return null

    try {
      const { id, ...updateData } = projectData
      const projectRef = doc(db, 'projects', id)
      
      // Filter out undefined values to avoid Firestore errors
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      await updateDoc(projectRef, {
        ...filteredUpdateData,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: 'Success',
        description: 'Project updated successfully',
      })

      return true
    } catch (error: any) {
      console.error('Update project error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      })
      return null
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!user) return false

    try {
      await deleteDoc(doc(db, 'projects', projectId))
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      })

      return true
    } catch (error: any) {
      console.error('Delete project error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
      return false
    }
  }

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject
  }
}
