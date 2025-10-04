import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Meeting {
  id: string
  title: string
  description?: string
  meetingDate: string
  meetingTime: string
  duration: number
  location?: string
  attendees?: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  userId: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMeetingData {
  title: string
  description?: string
  meetingDate: string
  meetingTime: string
  duration?: number
  location?: string
  attendees?: string[]
  projectId?: string
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  id: string
}

export const useFirebaseMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      setMeetings([])
      setLoading(false)
      return
    }

    // Create query for meetings
    const q = query(
      collection(db, 'meetings'),
      where('userId', '==', user.uid),
      orderBy('meetingDate', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meeting[]
      setMeetings(meetingsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const createMeeting = async (meetingData: CreateMeetingData) => {
    if (!user) return null

    try {
      const meetingDoc = {
        ...meetingData,
        userId: user.uid,
        duration: meetingData.duration || 60,
        status: 'scheduled' as const,
        attendees: meetingData.attendees || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'meetings'), meetingDoc)
      
      toast({
        title: 'Success',
        description: 'Meeting created successfully',
      })

      return { id: docRef.id, ...meetingDoc }
    } catch (error: any) {
      console.error('Create meeting error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create meeting',
        variant: 'destructive',
      })
      return null
    }
  }

  const updateMeeting = async (meetingData: UpdateMeetingData) => {
    if (!user) return null

    try {
      const { id, ...updateData } = meetingData
      const meetingRef = doc(db, 'meetings', id)
      
      await updateDoc(meetingRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: 'Success',
        description: 'Meeting updated successfully',
      })

      return true
    } catch (error: any) {
      console.error('Update meeting error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update meeting',
        variant: 'destructive',
      })
      return null
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!user) return false

    try {
      await deleteDoc(doc(db, 'meetings', meetingId))
      
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully',
      })

      return true
    } catch (error: any) {
      console.error('Delete meeting error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete meeting',
        variant: 'destructive',
      })
      return false
    }
  }

  return {
    meetings,
    loading,
    createMeeting,
    updateMeeting,
    deleteMeeting
  }
}


