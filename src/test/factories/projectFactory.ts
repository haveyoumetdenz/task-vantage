export interface ProjectData {
  id?: string
  title: string
  description?: string
  status?: 'active' | 'completed' | 'cancelled'
  progress?: number
  startDate?: string
  endDate?: string
  teamMembers?: string[]
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

export const createProjectData = (overrides: Partial<ProjectData> = {}): ProjectData => {
  const now = new Date().toISOString()
  const startDate = new Date().toISOString()
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  
  return {
    id: `project-${Date.now()}`,
    title: 'Test Project',
    description: 'Test project description',
    status: 'active',
    progress: 0,
    startDate,
    endDate,
    teamMembers: ['test-user-id'],
    createdBy: 'test-user-id',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export const createCompletedProject = (overrides: Partial<ProjectData> = {}): ProjectData => {
  return createProjectData({
    status: 'completed',
    progress: 100,
    ...overrides,
  })
}

export const createProjectWithTeam = (teamMembers: string[], overrides: Partial<ProjectData> = {}): ProjectData => {
  return createProjectData({
    teamMembers,
    ...overrides,
  })
}

export const createLongTermProject = (overrides: Partial<ProjectData> = {}): ProjectData => {
  const startDate = new Date().toISOString()
  const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
  
  return createProjectData({
    title: 'Long Term Project',
    startDate,
    endDate,
    ...overrides,
  })
}




