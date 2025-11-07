import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Plus, Search, Clock, TrendingUp, CheckSquare, Folder, ListPlus, Edit, Trash2 } from "lucide-react"
import { useFirebaseProjects } from "@/hooks/useFirebaseProjects"
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks"
import { useFirebaseRBAC } from "@/hooks/useFirebaseRBAC"
import { CreateProjectDialog } from "@/components/forms/CreateProjectDialog"
import { CreateTaskDialog } from "@/components/forms/CreateTaskDialog"
import { EditProjectDialog } from "@/components/forms/EditProjectDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns"
import { useNavigate } from "react-router-dom"

export default function Projects() {
  const [search, setSearch] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('my')
  const [includeMyProjects, setIncludeMyProjects] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null)
  const { projects, loading, deleteProject } = useFirebaseProjects()
  const { tasks: allTasks } = useFirebaseTasks() // Get all tasks
  const { canViewTeamWork, profile, isManager, isDirector, isSeniorManagement, getVisibleTeams } = useFirebaseRBAC()
  const navigate = useNavigate()
  
  // Debug logging (reduced)
  console.log('🔍 Projects page - User role:', profile?.role, 'Team:', profile?.teamId)
  
  // Calculate task counts for each project
  const projectsWithCounts = projects.map(project => {
    const projectTasks = allTasks.filter(task => task.projectId === project.id)
    const completedTasks = projectTasks.filter(task => task.status === 'completed')
    
    // Calculate real-time progress as fallback
    const realTimeProgress = projectTasks.length > 0 
      ? Math.round((completedTasks.length / projectTasks.length) * 100) 
      : 0
    
    // Use real-time progress if database progress seems outdated
    const displayProgress = (project.progress === 0 && realTimeProgress > 0) 
      ? realTimeProgress 
      : project.progress
    
    // Determine if project should be marked as completed based on real-time data
    const shouldBeCompleted = realTimeProgress === 100 && projectTasks.length > 0
    const displayStatus = shouldBeCompleted ? 'completed' : project.status
    
    return {
      ...project,
      taskCount: projectTasks.length,
      completedTaskCount: completedTasks.length,
      progress: displayProgress,
      status: displayStatus
    }
  })

  // Filter projects based on visible teams (for Staff/HR users)
  const visibleTeams = getVisibleTeams()
  
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
    // If user can view all teams (Senior Management, Director), show all projects
    if (isSeniorManagement || isDirector) {
      return true
    }
    
    // For Staff/HR/Manager users, only show projects from their visible teams
    // If user profile is not loaded, don't show any projects
    if (!profile) {
      return false
    }
    
    // For Staff/HR/Manager users, only show projects from their visible teams
    // Projects must have a teamId and that teamId must be in the user's visible teams
    const shouldShow = project.teamId && visibleTeams.includes(project.teamId)
    return shouldShow
  })
  

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId)
    setOpenCreateTask(true)
  }

  const handleEditProject = (project: any) => {
    setSelectedProject(project)
    setOpenEdit(true)
  }

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return
    
    const result = await deleteProject(projectToDelete.id)
    if (result) {
      setShowDeleteDialog(false)
      setProjectToDelete(null)
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
      // For "My Projects", we should include projects where user is assigned,
      // even if the project's team isn't visible to them
      const myProjects = projectsWithCounts.filter(project => {
        const isCreator = project.userId === profile?.userId
        const isAssigned = (project.assigneeIds && project.assigneeIds.includes(profile?.userId || '')) ||
                          (project.assignee_ids && project.assignee_ids.includes(profile?.userId || ''))
        
        // If user is Senior Management or Director, show all projects they created or are assigned to
        if (isSeniorManagement || isDirector) {
          return isCreator || isAssigned
        }
        
        // For other users, check if project is in visible teams OR user is assigned
        const isInVisibleTeam = project.teamId && visibleTeams.includes(project.teamId)
        return (isCreator || isAssigned) && (isInVisibleTeam || isAssigned)
      })
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
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow" onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
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
              {projects.filter(p => {
                // Check both dueDate (camelCase) and due_date (snake_case) for compatibility
                const dueDateValue = p.dueDate || (p as any).due_date
                if (!dueDateValue || p.status === 'completed' || p.status === 'archived') return false
                try {
                  const dueDate = startOfDay(new Date(dueDateValue)) // Normalize to start of day
                  const now = new Date()
                  const weekStart = startOfDay(startOfWeek(now, { weekStartsOn: 1 })) // Monday at 00:00
                  const weekEnd = endOfDay(endOfWeek(now, { weekStartsOn: 1 })) // Sunday at 23:59:59
                  
                  // Debug logging
                  console.log('Due This Week check:', {
                    project: p.title,
                    dueDateValue: dueDateValue,
                    dueDate: dueDate.toISOString(),
                    weekStart: weekStart.toISOString(),
                    weekEnd: weekEnd.toISOString(),
                    isInWeek: dueDate >= weekStart && dueDate <= weekEnd
                  })
                  
                  return dueDate >= weekStart && dueDate <= weekEnd
                } catch (error) {
                  console.error('Error checking due date:', error, p)
                  return false
                }
              }).length}
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
              <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
            </Section>
            <Section title="My Completed Projects">
              <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
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
              <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
            </Section>
            <Section title="Team Completed Projects">
              <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
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
            <Grid projects={filtered.filter(p => p.status === "active")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
          </Section>
          <Section title="Completed Projects">
            <Grid projects={filtered.filter(p => p.status === "completed")} onAddTask={handleAddTask} onEditProject={handleEditProject} onDeleteProject={handleDeleteProject} />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project "{projectToDelete?.title}" and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProject} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function Grid({ projects, onAddTask, onEditProject, onDeleteProject }: { 
  projects: any[]; 
  onAddTask: (projectId: string) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
}) {
  if (projects.length === 0) return <div className="text-sm text-muted-foreground">No items</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onAddTask={onAddTask} 
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  )
}

function ProjectCard({ project, onAddTask, onEditProject, onDeleteProject }: { 
  project: any; 
  onAddTask: (projectId: string) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteProject(project)
              }}
              className="opacity-70 hover:opacity-100 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
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
                {daysUntilDue > 0 ? `Due ${format(new Date(dueDateValue as string), 'MMM dd')}` : 'Overdue'}
              </div>
            )}
      </CardContent>
    </Card>
  )
}
