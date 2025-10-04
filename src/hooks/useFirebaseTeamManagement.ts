import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useToast } from '@/hooks/use-toast'

export const useFirebaseTeamManagement = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const updateMemberStatus = async (userId: string, status: 'active' | 'deactivated') => {
    setLoading(true)
    try {
      const profileRef = doc(db, 'profiles', userId)
      await updateDoc(profileRef, {
        status,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Member status updated successfully",
      })
    } catch (error: any) {
      console.error('Update member status error:', error)
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (userId: string, role: string) => {
    setLoading(true)
    try {
      const profileRef = doc(db, 'profiles', userId)
      await updateDoc(profileRef, {
        role,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Member role updated successfully",
      })
    } catch (error: any) {
      console.error('Update member role error:', error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMemberTeam = async (userId: string, teamId: string) => {
    setLoading(true)
    try {
      const profileRef = doc(db, 'profiles', userId)
      await updateDoc(profileRef, {
        teamId,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Success",
        description: "Member team updated successfully",
      })
    } catch (error: any) {
      console.error('Update member team error:', error)
      toast({
        title: "Error",
        description: "Failed to update member team",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    updateMemberStatus,
    updateMemberRole,
    updateMemberTeam
  }
}

