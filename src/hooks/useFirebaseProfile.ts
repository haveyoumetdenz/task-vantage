import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Profile {
  id: string
  userId: string
  email: string
  fullName: string
  avatarUrl?: string
  role: 'Staff' | 'Manager' | 'HR' | 'Director' | 'Senior Management'
  teamId?: string
  status: 'active' | 'pending' | 'deactivated'
  mfaEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export const useFirebaseProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    // Set up real-time listener for user profile
    const profileRef = doc(db, 'profiles', user.uid)
    const unsubscribe = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const profileData = { id: doc.id, ...doc.data() } as Profile
        setProfile(profileData)
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          userId: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email || 'User',
          role: 'Staff' as const,
          status: 'active' as const,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setDoc(profileRef, newProfile).then(() => {
          setProfile({ id: doc.id, ...newProfile } as Profile)
        }).catch(console.error)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false

    try {
      const profileRef = doc(db, 'profiles', user.uid)
      
      // Check if profile exists, if not create it
      const profileDoc = await getDoc(profileRef)
      if (!profileDoc.exists()) {
        // Create new profile
        const newProfile = {
          userId: user.uid,
          email: user.email || '',
          fullName: user.displayName || '',
          avatarUrl: user.photoURL || '',
          role: 'Staff' as const,
          status: 'active' as const,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await setDoc(profileRef, newProfile)
      } else {
        // Update existing profile
        await updateDoc(profileRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        })
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      return true
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
      return false
    }
  }

  const isManager = profile?.role && ['Manager', 'HR', 'Director', 'Senior Management'].includes(profile.role)

  return {
    profile,
    loading,
    updateProfile,
    isManager
  }
}
