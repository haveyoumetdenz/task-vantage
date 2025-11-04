export interface UserData {
  userId: string
  email: string
  fullName: string
  displayName?: string
  role: 'Staff' | 'Manager' | 'Director' | 'HR' | 'Senior Management'
  teamId?: string
  teamName?: string
  isActive?: boolean
  status?: 'active' | 'deactivated'
  createdAt?: string
  updatedAt?: string
}

export const createUserData = (overrides: Partial<UserData> = {}): UserData => {
  const now = new Date().toISOString()
  
  return {
    userId: `user-${Date.now()}`,
    email: 'test@example.com',
    fullName: 'Test User',
    displayName: 'Test User',
    role: 'Staff',
    teamId: 'test-team-id',
    teamName: 'Test Team',
    isActive: true,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export const createManagerUser = (overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    role: 'Manager',
    teamId: 'manager-team-id',
    teamName: 'Manager Team',
    ...overrides,
  })
}

export const createDirectorUser = (overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    role: 'Director',
    teamId: 'director-team-id',
    teamName: 'Director Team',
    ...overrides,
  })
}

export const createHRUser = (overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    role: 'HR',
    teamId: 'hr-team-id',
    teamName: 'HR Team',
    ...overrides,
  })
}

export const createSeniorManagementUser = (overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    role: 'Senior Management',
    teamId: 'senior-team-id',
    teamName: 'Senior Management Team',
    ...overrides,
  })
}

export const createDeactivatedUser = (overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    isActive: false,
    status: 'deactivated',
    ...overrides,
  })
}

export const createUserWithTeam = (teamId: string, teamName: string, overrides: Partial<UserData> = {}): UserData => {
  return createUserData({
    teamId,
    teamName,
    ...overrides,
  })
}




