import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

export interface Team {
  id: string
  name: string
  description?: string
  parentTeamId?: string
  managerId: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export const useFirebaseTeams = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create query for teams - no authentication required for public teams list
    const q = query(
      collection(db, 'teams'),
      orderBy('createdAt', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[]
      setTeams(teamsData)
      setLoading(false)
    }, (error) => {
      console.error('Teams query error:', error)
      console.log('💡 To fix this: Update Firebase Security Rules to allow reading teams')
      console.log('📋 See MANUAL_FIREBASE_RULES_SETUP.md for instructions')
      setLoading(false)
    })

    return () => unsubscribe()
  }, []) // Remove user dependency since we don't need authentication for teams

  // Helper function to get teams by parent
  const getTeamsByParent = (parentId: string | null) => {
    return teams.filter(team => team.parentTeamId === parentId)
  }

  // Helper function to get team hierarchy
  const getTeamHierarchy = () => {
    const hierarchy: { [key: string]: Team[] } = {}
    
    // Get top-level teams (no parent)
    hierarchy['root'] = getTeamsByParent(null)
    
    // Get sub-teams for each team
    teams.forEach(team => {
      if (team.parentTeamId) {
        if (!hierarchy[team.parentTeamId]) {
          hierarchy[team.parentTeamId] = []
        }
        hierarchy[team.parentTeamId].push(team)
      }
    })
    
    return hierarchy
  }

  return {
    teams,
    loading,
    getTeamsByParent,
    getTeamHierarchy
  }
}

