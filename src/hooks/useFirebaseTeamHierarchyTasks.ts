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
  const { canViewTeamWork, profile, getVisibleTeams, isDirector, isSeniorManagement } = useFirebaseRBAC()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setMyTasks([])
      setTeamTasks([])
      setLoading(false)
      return
    }

    // Get user's own tasks
    const myTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    // Debug: Check all tasks in database (only once)
    if (user) {
      const allTasksQuery = query(collection(db, 'tasks'))
      const unsubscribeAllTasks = onSnapshot(allTasksQuery, (snapshot) => {
        console.log('🔍 All tasks in database:', {
          totalTasks: snapshot.size,
          tasks: snapshot.docs.map(doc => ({
            id: doc.id,
            userId: doc.data().userId,
            title: doc.data().title,
            status: doc.data().status,
            createdAt: doc.data().createdAt
          }))
        })
        
        if (snapshot.size === 0) {
          console.log('⚠️ NO TASKS FOUND IN DATABASE!')
          console.log('💡 You need to create some tasks first:')
          console.log('1. Login as Test 1 (dentkq@hotmail.com)')
          console.log('2. Create a task')
          console.log('3. Then check as Director')
        }
      }, (error) => {
        console.error('❌ Error fetching all tasks:', error)
      })
      
      // Unsubscribe after first check
      setTimeout(() => {
        unsubscribeAllTasks()
      }, 2000)
    }

    const unsubscribeMyTasks = onSnapshot(myTasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        creatorName: profile?.fullName || 'Unknown',
        projectName: 'No Project', // Would need to join with projects
        teamName: 'My Team',
        subtaskCount: 0
      })) as TeamHierarchyTask[]

      setMyTasks(tasksData)
    })

    // Get team tasks if user can view team work
    let unsubscribeTeamTasks: (() => void) | undefined

    if (canViewTeamWork) {
      // Get all tasks from visible teams
      const visibleTeams = getVisibleTeams()
      console.log('👥 Visible teams for team tasks:', visibleTeams)
      
      if (visibleTeams.length > 0) {
        // First, get team members from visible teams
        const teamMembersQuery = query(
          collection(db, 'profiles'),
          where('teamId', 'in', visibleTeams)
        )

        const unsubscribeTeamMembers = onSnapshot(teamMembersQuery, (membersSnapshot) => {
          const teamMemberIds = membersSnapshot.docs.map(doc => doc.id)
          console.log('👥 Team member query result:', {
            visibleTeams,
            teamMemberCount: membersSnapshot.size,
            teamMemberIds
          })
          
          if (teamMemberIds.length > 0) {
            // Now query tasks from team members
            const teamTasksQuery = query(
              collection(db, 'tasks'),
              where('userId', 'in', teamMemberIds),
              orderBy('createdAt', 'desc')
            )

            unsubscribeTeamTasks = onSnapshot(teamTasksQuery, (snapshot) => {
              console.log('🔍 Team tasks query result:', {
                snapshotSize: snapshot.size,
                docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
              })
              
              const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                creatorName: 'Team Member', // Would need to get actual creator name
                projectName: 'No Project',
                teamName: 'Team Task',
                subtaskCount: 0
              })) as TeamHierarchyTask[]

              // For team tasks, we want to show ALL tasks from team members (including own tasks)
              // The "My Tasks" vs "Team Tasks" separation is handled in the UI, not here
              const filteredTeamTasks = tasksData
              console.log('🔍 Processed team tasks data:', tasksData)
              console.log('🔍 Team tasks (all team member tasks):', filteredTeamTasks)
              console.log('🔍 Setting teamTasks state with:', filteredTeamTasks.length, 'tasks')
              setTeamTasks(filteredTeamTasks)
              setLoading(false)
            }, (error) => {
              console.error('Error fetching team tasks:', error)
              setLoading(false)
            })
          } else {
            console.log('⚠️ No team members found for visible teams:', visibleTeams)
            setTeamTasks([])
            setLoading(false)
          }
        }, (error) => {
          console.error('❌ Error fetching team members:', error)
          setTeamTasks([])
          setLoading(false)
        })

        return () => {
          unsubscribeMyTasks()
          unsubscribeTeamMembers()
          if (unsubscribeTeamTasks) {
            unsubscribeTeamTasks()
          }
        }
      } else {
        setTeamTasks([])
        setLoading(false)
        return () => {
          unsubscribeMyTasks()
        }
      }
    } else {
      setTeamTasks([])
      setLoading(false)
      return () => {
        unsubscribeMyTasks()
      }
    }
  }, [user, profile, canViewTeamWork])

  return {
    myTasks,
    teamTasks,
    loading
  }
}


