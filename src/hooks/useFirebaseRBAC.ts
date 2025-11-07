import { useFirebaseProfile } from './useFirebaseProfile'

export interface TeamHierarchy {
  teamId: string
  teamName: string
  parentTeamId?: string
  level: number
}

export const useFirebaseRBAC = () => {
  const { profile, loading } = useFirebaseProfile()

  // Updated RBAC logic based on new requirements
  const isStaff = profile?.role === 'Staff'
  const isManager = profile?.role === 'Manager'
  const isDirector = profile?.role === 'Director'
  const isSeniorManagement = profile?.role === 'Senior Management'
  const isHR = profile?.role === 'HR' || (profile?.role === 'Manager' && profile?.teamId === 'hr')
  
  // Debug role detection (reduced)
  console.log('🔍 RBAC Role:', profile?.role)
  console.log('🔍 RBAC Team:', profile?.teamId)
  console.log('🔍 RBAC isHR:', isHR)

  // Team visibility rules - Staff can see team tasks too
  const canViewTeamWork = isStaff || isManager || isDirector || isSeniorManagement || isHR
  const canViewAllTeams = isSeniorManagement // Senior management can see everyone
  const canViewOwnTeam = isStaff || isManager || isDirector || isHR // All roles can see their own team
  const canViewSubTeams = isDirector || isSeniorManagement // Directors and senior management can see sub-teams

  // Management permissions - Updated to allow all users
  const canManageUsers = true // Allow all users to access team management
  const canViewReports = isManager || isDirector || isSeniorManagement || isHR
  const canManageTeams = true // Allow all users to manage teams

  // Team hierarchy based on role and organizational structure
  const getTeamHierarchy = () => {
    // Senior Management is not in any specific team - they oversee all teams
    if (isSeniorManagement) {
      return [
        { teamId: 'engineering-1', teamName: 'Engineering 1 (Director level)', level: 0 },
        { teamId: 'engineering-2', teamName: 'Engineering 2 (Manager level)', level: 0 },
        { teamId: 'hr', teamName: 'HR (Director level)', level: 0 }
      ]
    }
    
    // If user has no teamId (should only be Senior Management), return empty
    if (!profile?.teamId) {
      if (isSeniorManagement) {
        return [
          { teamId: 'engineering-1', teamName: 'Engineering 1 (Director level)', level: 0 },
          { teamId: 'engineering-2', teamName: 'Engineering 2 (Manager level)', level: 0 },
          { teamId: 'hr', teamName: 'HR (Director level)', level: 0 }
        ]
      }
      return []
    }
    
    const hierarchy: TeamHierarchy[] = []
    
    // Add current team
    hierarchy.push({
      teamId: profile.teamId,
      teamName: getTeamName(profile.teamId),
      level: 0
    })

    // Add sub-teams based on role and organizational structure
    if (canViewSubTeams) {
      // Directors in Engineering 1 can see Engineering 2 (which reports to Engineering 1)
      if (profile.teamId === 'engineering-1' && isDirector) {
        hierarchy.push({
          teamId: 'engineering-2',
          teamName: 'Engineering 2 (Manager level)',
          parentTeamId: 'engineering-1',
          level: 1
        })
      }
    }

    return hierarchy
  }

  const getTeamName = (teamId: string) => {
    const teamNames: Record<string, string> = {
      'engineering-1': 'Engineering 1',
      'engineering-2': 'Engineering 2',
      'hr': 'HR',
      'senior-management': 'Senior Management'
    }
    return teamNames[teamId] || 'Unknown Team'
  }

  // Get teams user can see tasks/projects for
  const getVisibleTeams = () => {
    console.log('🔍 getVisibleTeams called for user:', {
      role: profile?.role,
      teamId: profile?.teamId,
      isSeniorManagement,
      isDirector,
      isManager,
      isHR,
      isStaff,
      canViewAllTeams
    })
    
    // Senior Management can see all teams (they're not in any specific team)
    // Even if they have a teamId in the database, treat them as not in any team
    if (isSeniorManagement) {
      console.log('Senior Management - can see all teams')
      return ['engineering-1', 'engineering-2', 'hr']
    }
    
    if (canViewAllTeams) {
      console.log('Can view all teams - returning all teams')
      return ['engineering-1', 'engineering-2', 'hr']
    }
    
    if (canViewSubTeams && profile?.teamId) {
      const visibleTeams = [profile.teamId]
      
      // Directors in Engineering 1 can see Engineering 2
      if (profile.teamId === 'engineering-1' && isDirector) {
        visibleTeams.push('engineering-2')
        console.log('Director in Engineering 1 - can see Engineering 2')
      }
      
      console.log('Visible teams for user:', {
        role: profile?.role,
        teamId: profile?.teamId,
        canViewSubTeams,
        isDirector,
        visibleTeams
      })
      
      return visibleTeams
    }
    
    const result = profile?.teamId ? [profile.teamId] : []
    console.log('Default visible teams for Manager/Staff/HR:', {
      profileTeamId: profile?.teamId,
      result: result,
      role: profile?.role
    })
    return result
  }

  // Get user's role level for hierarchy
  const getRoleLevel = () => {
    if (isSeniorManagement) return 4
    if (isDirector) return 3
    if (isManager) return 2
    if (isHR) return 2
    if (isStaff) return 1
    return 0
  }

  // Check if user can edit a specific task
  const canEditTask = (taskUserId: string, taskTeamId?: string) => {
    // Always allow users to edit their own tasks
    if (taskUserId === profile?.userId) {
      return true
    }

    // Senior Management can edit all tasks
    if (isSeniorManagement) {
      return true
    }

    // Directors can edit tasks from their managed teams
    if (isDirector) {
      const managedTeams = getManagedTeams()
      return managedTeams.includes(taskTeamId || '')
    }

    // Managers can edit tasks from their team only
    if (isManager && profile?.teamId === taskTeamId) {
      return true
    }

    // Staff can only edit their own tasks (already checked above)
    return false
  }

  // Check if user can reassign tasks (change assignees)
  // Only assignees (owners) can reassign tasks
  const canReassignTasks = (assigneeIds?: string[]) => {
    if (!profile?.userId) return false
    if (!assigneeIds || assigneeIds.length === 0) return false
    // User must be in the assigneeIds array to reassign
    return assigneeIds.includes(profile.userId)
  }

  const getManagedTeams = () => {
    if (!canViewTeamWork) return []
    return getTeamHierarchy().map(team => team.teamId)
  }

  const getTeamDescendants = (teamId: string) => {
    if (!canViewSubTeams) return []
    return getTeamHierarchy().filter(team => team.parentTeamId === teamId)
  }

  // Get team assignments based on organizational hierarchy
  const getTeamAssignments = () => {
    if (isSeniorManagement) {
      // Senior Management is not in any specific team - they oversee everyone
      // They should not be assigned to any team
      return []
    }
    if (isDirector) {
      // Directors can be in Engineering 1 or HR (highest role in these teams)
      return ['engineering-1', 'hr']
    }
    if (isManager) {
      // Managers can be in Engineering 2 (highest role), Engineering 1, or HR
      return ['engineering-1', 'engineering-2', 'hr']
    }
    if (isHR) {
      // HR role can be in HR team
      return ['hr']
    }
    if (isStaff) {
      // Staff can be in any team
      return ['engineering-1', 'engineering-2', 'hr']
    }
    return []
  }

  // Check if a user should be in a team based on their role
  const shouldUserBeInTeam = (role: string, teamId: string) => {
    if (role === 'Senior Management') {
      // Senior Management should never be in any team
      return false
    }
    
    // For other roles, use the existing logic
    return canRoleBeInTeam(role, teamId)
  }

  // Get the highest role allowed in each team
  const getTeamRoleLimits = () => {
    return {
      'engineering-1': 'Director', // Highest role in Engineering 1
      'engineering-2': 'Manager',  // Highest role in Engineering 2
      'hr': 'Director',            // Highest role in HR
      'senior-management': 'Senior Management' // Senior Management is separate
    }
  }

  // Check if a role can be assigned to a specific team
  const canRoleBeInTeam = (role: string, teamId: string) => {
    const roleLimits = getTeamRoleLimits()
    const teamLimit = roleLimits[teamId as keyof typeof roleLimits]
    
    if (!teamLimit) return false
    
    // Define role hierarchy (higher number = higher role)
    const roleHierarchy: Record<string, number> = {
      'Staff': 1,
      'Manager': 2,
      'Director': 3,
      'Senior Management': 4
    }
    
    const roleLevel = roleHierarchy[role] || 0
    const teamLimitLevel = roleHierarchy[teamLimit] || 0
    
    return roleLevel <= teamLimitLevel
  }

  return {
    profile,
    loading,
    // Role checks
    isStaff,
    isManager,
    isDirector,
    isSeniorManagement,
    isHR,
    // Permissions
    canViewTeamWork,
    canViewAllTeams,
    canViewOwnTeam,
    canViewSubTeams,
    canManageUsers,
    canViewReports,
    canManageTeams,
    // Team hierarchy
    teamHierarchy: getTeamHierarchy(),
    getManagedTeams,
    getTeamDescendants,
    getVisibleTeams,
    getRoleLevel,
    getTeamAssignments,
    getTeamRoleLimits,
    canRoleBeInTeam,
    shouldUserBeInTeam,
    // Task permissions
    canEditTask,
    canReassignTasks,
    // Team management
    getTeamManagers: () => {
      if (!profile?.teamId) {
        console.log('🔧 getTeamManagers - No teamId found')
        return []
      }
      
      console.log('🔧 getTeamManagers - teamId:', profile.teamId)
      console.log('🔧 getTeamManagers - This would query database for managers in team')
      
      // TODO: Implement database query to get team managers
      // This would query profiles where role='Manager' AND teamId=profile.teamId
      // For now, return empty array to avoid breaking the system
      return []
    }
  }
}


