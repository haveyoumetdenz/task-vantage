import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseRBAC } from './useFirebaseRBAC'
import { useToast } from '@/hooks/use-toast'

export interface TeamHierarchyTask {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: number
  dueDate?: string
  completedAt?: string
  userId: string
  projectId?: string
  assigneeIds?: string[]
  createdAt: string
  updatedAt: string
  creatorName?: string
  projectName?: string
  teamName?: string
  subtaskCount?: number
}

export const useFirebaseTeamHierarchyTasks = () => {
  const [myTasks, setMyTasks] = useState<TeamHierarchyTask[]>([])
  const [teamTasks, setTeamTasks] = useState<TeamHierarchyTask[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { canViewTeamWork, profile } = useFirebaseRBAC()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setMyTasks([])
      setTeamTasks([])
      setLoading(false)
      return
    }

    // For now, just show user's own tasks
    // In a full implementation, you'd query team members and their tasks
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        creatorName: profile?.fullName || 'Unknown',
        projectName: 'No Project', // Would need to join with projects
        teamName: 'My Team',
        subtaskCount: 0
      })) as TeamHierarchyTask[]

      setMyTasks(tasksData)
      setTeamTasks([]) // For now, no team tasks
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, profile])

  return {
    myTasks,
    teamTasks,
    loading
  }
}


