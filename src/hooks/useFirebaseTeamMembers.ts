import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'

export interface TeamMember {
  id: string
  userId: string
  email: string
  fullName: string
  avatarUrl?: string
  role: 'Staff' | 'Manager' | 'HR' | 'Director' | 'Senior Management'
  teamId?: string
  status: 'active' | 'pending' | 'deactivated'
  createdAt: string
  updatedAt: string
}

export const useFirebaseTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setTeamMembers([])
      setLoading(false)
      return
    }

    // Create query for team members
    const q = query(
      collection(db, 'profiles'),
      where('teamId', '!=', null),
      orderBy('teamId'),
      orderBy('createdAt', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[]
      setTeamMembers(membersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return {
    teamMembers,
    loading
  }
}


