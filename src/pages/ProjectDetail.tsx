import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Calendar, Users, CheckSquare, Clock } from "lucide-react"
import { useFirebaseProjects, Project } from "@/hooks/useFirebaseProjects"
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks"
import { CreateTaskDialog } from "@/components/forms/CreateTaskDialog"
import { format } from "date-fns"
import { updateProjectProgress } from "@/utils/projectProgress"

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const { projects, loading: projectsLoading } = useFirebaseProjects()
  const { tasks, loading: tasksLoading } = useFirebaseTasks(id)

  const project = projects.find(p => p.id === id)

  // Trigger project progress update when tasks are loaded
  useEffect(() => {
    if (id && tasks.length > 0 && !tasksLoading) {
      console.log('🔄 Triggering project progress update for project:', id)
      updateProjectProgress(id, tasks).catch(error => {
        console.error('❌ Error updating project progress:', error)
      })
    }
  }, [id, tasks, tasksLoading])

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  // Group recurring tasks and their instances to avoid duplicates
  const processedTasks = tasks.reduce((acc, task) => {
    // If this is a virtual instance (has parentTaskId), group it with its parent
    if (task.parentTaskId) {
      const parentId = task.parentTaskId
      if (!acc[parentId]) {
        // Find the parent task
        const parentTask = tasks.find(t => t.id === parentId)
        if (parentTask) {
          acc[parentId] = {
            ...parentTask,
            instances: [task],
            // For navigation, use the parent task ID
            navigationId: parentId
          }
        }
      } else {
        acc[parentId].instances.push(task)
      }
    } else {
      // Regular task or parent recurring task
      acc[task.id] = {
        ...task,
        instances: [],
        // For navigation, use the task's own ID
        navigationId: task.id
      }
    }
    return acc
  }, {} as Record<string, any>)

  const taskGroups = Object.values(processedTasks)
  const totalTasks = taskGroups.length
  const completedTasks = taskGroups.filter(t => t.status === 'completed').length
  const inProgressTasks = taskGroups.filter(t => t.status === 'in_progress').length
  const todoTasks = taskGroups.filter(t => t.status === 'todo').length

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate real-time progress as fallback (same logic as Projects.tsx)
  const realTimeProgress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0
  
  // Use real-time progress if database progress seems outdated
  const displayProgress = (project.progress === 0 && realTimeProgress > 0) 
    ? realTimeProgress 
    : project.progress

  // Debug logging
  console.log('ProjectDetail Debug:', {
    projectId: id,
    tasksLoading,
    tasksCount: tasks.length,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionPercentage,
    realTimeProgress,
    displayProgress,
    projectProgress: project.progress,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status, projectId: t.projectId }))
  })

  const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    completed: "secondary",
    on_hold: "outline",
    archived: "destructive",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow" onClick={() => setOpenCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{completedTasks}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{inProgressTasks}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{todoTasks}</div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{displayProgress}%</span>
                </div>
                <Progress value={displayProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks ({totalTasks})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet. Add your first task to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {taskGroups.map((taskGroup) => (
                    <div 
                      key={taskGroup.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tasks/${taskGroup.navigationId}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <CheckSquare className={`h-4 w-4 ${taskGroup.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`} />
                          <div>
                            <h4 className="font-medium hover:text-primary transition-colors">{taskGroup.title}</h4>
                            {taskGroup.description && (
                              <p className="text-sm text-muted-foreground mt-1">{taskGroup.description}</p>
                            )}
                            {taskGroup.instances && taskGroup.instances.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {taskGroup.instances.length} instance{taskGroup.instances.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          taskGroup.status === 'completed' ? 'secondary' : 
                          taskGroup.status === 'in_progress' ? 'default' : 'outline'
                        }>
                          {taskGroup.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={
                          taskGroup.priority === 'urgent' ? 'destructive' :
                          taskGroup.priority === 'high' ? 'destructive' :
                          taskGroup.priority === 'medium' ? 'default' : 'outline'
                        }>
                          {taskGroup.priority}
                        </Badge>
                        {taskGroup.instances && taskGroup.instances.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={statusBadge[project.status] || "default"}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              
              <Separator />
              
              {project.dueDate && (
                <>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Due {project.dueDate ? format(new Date(project.dueDate), 'MMM dd, yyyy') : 'Unknown date'}</span>
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Created {project.createdAt ? format(new Date(project.createdAt), 'MMM dd, yyyy') : 'Unknown date'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Updated {project.updatedAt ? format(new Date(project.updatedAt), 'MMM dd, yyyy') : 'Unknown date'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTaskDialog 
        open={openCreateTask} 
        onOpenChange={setOpenCreateTask}
        defaultProjectId={project.id}
      />
    </div>
  )
}