import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { createProjectAssignmentNotification } from '@/utils/notifications'

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
  const { profile, isManager, isDirector, isSeniorManagement, canViewTeamWork, getVisibleTeams } = useFirebaseRBAC()

  useEffect(() => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    console.log('🔍 useFirebaseProjects - User role:', profile?.role)
    console.log('🔍 useFirebaseProjects - Is Manager:', isManager)
    console.log('🔍 useFirebaseProjects - Is Director:', isDirector)
    console.log('🔍 useFirebaseProjects - Is Senior Management:', isSeniorManagement)

    // Create query based on user role
    let q
    if (isSeniorManagement || isDirector) {
      // Directors and Senior Management can see all projects
      q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      )
      console.log('🔍 useFirebaseProjects - Querying ALL projects (Director/Senior Management)')
    } else if (canViewTeamWork) {
      // Staff/HR/Manager who can view team work can see projects from their visible teams
      // For now, we'll fetch all projects and filter in the UI based on visible teams
      q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      )
      console.log('🔍 useFirebaseProjects - Querying ALL projects (Staff/HR/Manager with team work access)')
      console.log('🔍 useFirebaseProjects - Visible teams:', getVisibleTeams())
    } else {
      // Staff/HR who cannot view team work can only see projects they're assigned to
      q = query(
        collection(db, 'projects'),
        where('assigneeIds', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      )
      console.log('🔍 useFirebaseProjects - Querying assigned projects only (Staff/HR without team work access)')
    }

    console.log('🔍 useFirebaseProjects - Querying projects for user:', user.uid)

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔍 useFirebaseProjects - Raw projects from Firebase:', snapshot.docs.length, 'projects')
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log('🔍 Project data:', doc.id, data)
        return {
          id: doc.id,
          ...data
        }
      }) as Project[]
      console.log('🔍 useFirebaseProjects - Processed projects:', projectsData)
      setProjects(projectsData)
      setLoading(false)
    }, (error) => {
      console.error('🔍 useFirebaseProjects - Error fetching projects:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, profile, isManager, isDirector, isSeniorManagement, canViewTeamWork])

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
      
      // Send assignment notifications to all assignees (except the creator)
      const assigneeIds = projectDoc.assigneeIds || []
      const otherAssignees = assigneeIds.filter(id => id !== user.uid)
      
      if (otherAssignees.length > 0) {
        console.log('🔔 Sending project assignment notifications to:', otherAssignees)
        try {
          await Promise.all(
            otherAssignees.map(assigneeId => 
              createProjectAssignmentNotification(
                assigneeId, 
                projectData.title, 
                docRef.id, 
                user.email || 'Someone'
              )
            )
          )
          console.log('✅ Project assignment notifications sent')
        } catch (error) {
          console.error('❌ Error sending project assignment notifications:', error)
        }
      }
      
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
      
      // Check if assignees are being updated and send notifications
      if (updateData.assigneeIds) {
        // Get current project data to compare assignees
        const currentProject = projects.find(p => p.id === id)
        if (currentProject) {
          const currentAssignees = currentProject.assigneeIds || []
          const newAssignees = updateData.assigneeIds
          const newlyAssigned = newAssignees.filter(id => !currentAssignees.includes(id))
          
          if (newlyAssigned.length > 0) {
            console.log('🔔 Sending project assignment notifications to newly assigned users:', newlyAssigned)
            try {
              await Promise.all(
                newlyAssigned.map(assigneeId => 
                  createProjectAssignmentNotification(
                    assigneeId, 
                    currentProject.title, 
                    id, 
                    user.email || 'Someone'
                  )
                )
              )
              console.log('✅ Project assignment notifications sent for updates')
            } catch (error) {
              console.error('❌ Error sending project assignment notifications for updates:', error)
            }
          }
        }
      }
      
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
