import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Plus, Search, Clock, TrendingUp, CheckSquare, Folder, ListPlus, Edit } from "lucide-react"
import { useFirebaseProjects } from "@/hooks/useFirebaseProjects"
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks"
import { useFirebaseRBAC } from "@/hooks/useFirebaseRBAC"
import { CreateProjectDialog } from "@/components/forms/CreateProjectDialog"
import { CreateTaskDialog } from "@/components/forms/CreateTaskDialog"
import { EditProjectDialog } from "@/components/forms/EditProjectDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { testProjectAssignmentNotification } from '@/utils/testProjectNotifications'

export default function Projects() {
  const [search, setSearch] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('my')
  const [includeMyProjects, setIncludeMyProjects] = useState(false)
  const { projects, loading } = useFirebaseProjects()
  const { tasks: allTasks } = useFirebaseTasks() // Get all tasks
  const { canViewTeamWork, profile, isManager, isDirector, isSeniorManagement, getVisibleTeams } = useFirebaseRBAC()
  const navigate = useNavigate()
  
  // Debug logging
  console.log('🔍 Projects page - User profile:', profile)
  console.log('🔍 Projects page - User role:', profile?.role)
  console.log('🔍 Projects page - User teamId:', profile?.teamId)
  console.log('🔍 Projects page - canViewTeamWork:', canViewTeamWork)
  console.log('🔍 Projects page - isManager:', isManager)
  console.log('🔍 Projects page - isDirector:', isDirector)
  console.log('🔍 Projects page - isSeniorManagement:', isSeniorManagement)
  console.log('🔍 Projects page - All projects:', projects)
  console.log('🔍 Projects page - Loading state:', loading)
  
  // Calculate task counts for each project
  const projectsWithCounts = projects.map(project => {
    const projectTasks = allTasks.filter(task => task.projectId === project.id)
    const completedTasks = projectTasks.filter(task => task.status === 'completed')
    return {
      ...project,
      taskCount: projectTasks.length,
      completedTaskCount: completedTasks.length
    }
  })

  // Filter projects based on visible teams (for Staff/HR users)
  const visibleTeams = getVisibleTeams()
  console.log('🔍 Projects page - Visible teams:', visibleTeams)
  
  // If profile is not loaded, don't filter projects yet
  if (!profile) {
    console.log('🔍 Profile not loaded - showing no projects until profile loads')
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
      </div>
    )
  }
  
  const filteredProjectsByTeam = projectsWithCounts.filter(project => {
    console.log('🔍 Filtering project:', {
      id: project.id,
      title: project.title,
      teamId: project.teamId,
      userId: project.userId,
      visibleTeams: visibleTeams,
      isSeniorManagement,
      isManager,
      isDirector
    })
    
    // If user can view all teams (Senior Management, Director), show all projects
    if (isSeniorManagement || isDirector) {
      console.log('🔍 User can view all teams - showing project', {
        isSeniorManagement,
        isManager,
        isDirector,
        userRole: profile?.role
      })
      return true
    }
    
    // For Staff/HR/Manager users, only show projects from their visible teams
    // If user profile is not loaded, don't show any projects
    if (!profile) {
      console.log('🔍 User profile not loaded - hiding project:', project.title)
      return false
    }
    
    // For Staff/HR/Manager users, only show projects from their visible teams
    // Projects must have a teamId and that teamId must be in the user's visible teams
    const shouldShow = project.teamId && visibleTeams.includes(project.teamId)
    console.log('🔍 Should show project:', shouldShow, 'because teamId:', project.teamId, 'is in visibleTeams:', visibleTeams, 'project title:', project.title)
    return shouldShow
  })
  
  console.log('🔍 Projects page - Filtered projects by team:', filteredProjectsByTeam)

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId)
    setOpenCreateTask(true)
  }

  const handleEditProject = (project: any) => {
    setSelectedProject(project)
    setOpenEdit(true)
  }

  const handleTestProjectNotification = async () => {
    if (!profile?.userId) {
      console.error('No user ID found')
      return
    }
    
    try {
      await testProjectAssignmentNotification(profile.userId)
      console.log('✅ Test project notification sent')
    } catch (error) {
      console.error('❌ Error sending test project notification:', error)
    }
  }

  // Role-based project filtering (aligned with task logic)
  const getProjectsForCurrentView = () => {
    console.log('🔍 Projects page - getProjectsForCurrentView called')
    console.log('🔍 Active tab:', activeTab)
    console.log('🔍 Include my projects:', includeMyProjects)
    console.log('🔍 All projects:', projectsWithCounts)
    console.log('🔍 Filtered projects by team:', filteredProjectsByTeam)
    console.log('🔍 Profile:', profile)
    
    if (activeTab === 'my') {
      // My projects: created by user OR user is assigned to project
      const myProjects = filteredProjectsByTeam.filter(project => 
        project.userId === profile?.userId || 
        (project.assigneeIds && project.assigneeIds.includes(profile?.userId || '')) ||
        (project.assignee_ids && project.assignee_ids.includes(profile?.userId || ''))
      )
      console.log('🔍 My projects (created by me OR assigned to me):', myProjects)
      return myProjects
    } else if (activeTab === 'team') {
      // Team projects: projects created by team members
      console.log('🔍 Team projects logic - canViewTeamWork:', canViewTeamWork)
      
      if (!canViewTeamWork) {
        console.log('🔍 User cannot view team work, returning empty array')
        return []
      }
      
      if (includeMyProjects) {
        console.log('🔍 Team projects (including my own):', filteredProjectsByTeam)
        return filteredProjectsByTeam
      }
      
      // Team projects: exclude my own projects (created by me)
      const teamProjects = filteredProjectsByTeam.filter(project => 
        project.userId !== profile?.userId
      )
      console.log('🔍 Team projects (excluding my own):', teamProjects)
      console.log('🔍 Team projects details:', teamProjects.map(p => ({ id: p.id, title: p.title, userId: p.userId, assigneeIds: p.assigneeIds, teamId: p.teamId })))
      return teamProjects
    }
    return filteredProjectsByTeam
  }

  const filtered = getProjectsForCurrentView().filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter(p => p.status === "active")
  const completed = filtered.filter(p => p.status === "completed")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Organize and track your project progress.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestProjectNotification}>
            Test Project Notification
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-glow" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{active.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {projects.filter(p => p.due_date && new Date(p.due_date) < new Date(new Date().setDate(new Date().getDate()+7))).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Role-based Project Views */}
      {canViewTeamWork ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my">My Projects</TabsTrigger>
            <TabsTrigger value="team">Team Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="my" className="space-y-8">
            <Section title="My Active Projects">
              <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
            </Section>
            <Section title="My Completed Projects">
              <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
            </Section>
            {filtered.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">No projects yet. Create your first project!</CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="team" className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeMyProjects}
                  onChange={(e) => setIncludeMyProjects(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include my projects</span>
              </label>
            </div>
            <Section title="Team Active Projects">
              <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
            </Section>
            <Section title="Team Completed Projects">
              <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
            </Section>
            {filtered.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">No team projects found.</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-8">
          <div className="mb-4">
            <h3 className="text-lg font-medium">My Projects</h3>
            <p className="text-sm text-muted-foreground">Projects you created or are a member of</p>
          </div>
          <Section title="Active Projects">
            <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
          </Section>
          <Section title="Completed Projects">
            <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} />
          </Section>
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No projects yet. Create your first project!</CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateProjectDialog open={openCreate} onOpenChange={setOpenCreate} />
      <EditProjectDialog open={openEdit} onOpenChange={setOpenEdit} project={selectedProject} />
      <CreateTaskDialog 
        open={openCreateTask} 
        onOpenChange={setOpenCreateTask}
        defaultProjectId={selectedProjectId || undefined}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Grid({ projects, onAddTask, onEditProject }: { 
  projects: any[]; 
  onAddTask: (projectId: string) => void;
  onEditProject: (project: any) => void;
}) {
  if (projects.length === 0) return <div className="text-sm text-muted-foreground">No items</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onAddTask={onAddTask} onEditProject={onEditProject} />
      ))}
    </div>
  )
}

function ProjectCard({ project, onAddTask, onEditProject }: { 
  project: any; 
  onAddTask: (projectId: string) => void;
  onEditProject: (project: any) => void;
}) {
  const navigate = useNavigate()
  const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    completed: "secondary",
    on_hold: "outline",
    archived: "destructive",
  }
  const daysUntilDue = project.due_date ? Math.ceil((new Date(project.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  return (
    <Card className="hover:shadow-medium transition-all duration-300 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEditProject(project)
              }}
              className="opacity-70 hover:opacity-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddTask(project.id)
              }}
              className="opacity-70 hover:opacity-100"
            >
              <ListPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Badge variant={statusBadge[project.status] || "default"}>{project.status.replace("_", " ")}</Badge>
          <span className="text-muted-foreground">
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
        </div>
        {daysUntilDue !== null && (
          <div className="text-sm text-muted-foreground">
            {daysUntilDue > 0 ? `Due ${format(new Date(project.due_date as string), 'MMM dd')}` : 'Overdue'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
