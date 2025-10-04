import { useFirebaseProfile } from './useFirebaseProfile'

export interface TeamHierarchy {
  teamId: string
  teamName: string
  parentTeamId?: string
  level: number
}

export const useFirebaseRBAC = () => {
  const { profile, loading } = useFirebaseProfile()

  // Simple RBAC logic for now
  const canViewTeamWork = profile?.role && ['Manager', 'HR', 'Director', 'Senior Management'].includes(profile.role)
  const canManageUsers = profile?.role && ['HR', 'Director', 'Senior Management'].includes(profile.role)
  const canViewReports = profile?.role && ['Manager', 'HR', 'Director', 'Senior Management'].includes(profile.role)
  const canManageTeams = profile?.role && ['Director', 'Senior Management'].includes(profile.role)

  // Mock team hierarchy for now
  const teamHierarchy: TeamHierarchy[] = profile?.teamId ? [{
    teamId: profile.teamId,
    teamName: 'My Team',
    level: 0
  }] : []

  const getManagedTeams = () => {
    if (!canViewTeamWork) return []
    return teamHierarchy
  }

  const getTeamDescendants = (teamId: string) => {
    if (!canViewTeamWork) return []
    return teamHierarchy.filter(team => team.parentTeamId === teamId)
  }

  return {
    profile,
    loading,
    canViewTeamWork,
    canManageUsers,
    canViewReports,
    canManageTeams,
    teamHierarchy,
    getManagedTeams,
    getTeamDescendants
  }
}


