import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

export interface UserProfile {
  userId: string
  fullName: string
  email: string
  avatarUrl?: string
  role?: string
  teamId?: string
}

export const useFirebaseUserProfiles = (userIds: string[]) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setProfiles([])
      setLoading(false)
      return
    }

    // Prevent unnecessary re-renders by checking if userIds actually changed
    const userIdsString = userIds.join(',')
    if (userIdsString === '') {
      setProfiles([])
      setLoading(false)
      return
    }

    const fetchProfiles = async () => {
      try {
        setLoading(true)
        
        // Query profiles collection for the given user IDs
        const q = query(
          collection(db, 'profiles'),
          where('userId', 'in', userIds)
        )
        
        const snapshot = await getDocs(q)
        const profilesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[]
        
        setProfiles(profilesData)
      } catch (error) {
        console.error('Error fetching user profiles:', error)
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [userIds.join(',')]) // Use join to create a stable dependency

  return { profiles, loading }
}
