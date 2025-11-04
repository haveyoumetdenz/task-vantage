import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarWithVirtualInstances } from '@/components/calendar/CalendarWithVirtualInstances'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFirebaseTasks, Task } from '@/hooks/useFirebaseTasks'
import { useFirebaseTeamHierarchyTasks } from '@/hooks/useFirebaseTeamHierarchyTasks'
import { useFirebaseTeamMembers } from '@/hooks/useFirebaseTeamMembers'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Calendar as CalendarIcon, Users, Bell, Repeat } from 'lucide-react'
import { CreateTaskDialog } from '@/components/forms/CreateTaskDialog'
import { CreateRecurringTaskDialog } from '@/components/forms/CreateRecurringTaskDialog'
import { TaskNotifications } from '@/components/calendar/TaskNotifications'

// Function to deduplicate tasks based on task ID
const deduplicateTasks = (tasks: any[]) => {
  const seen = new Set()
  return tasks.filter(task => {
    if (seen.has(task.id)) {
      return false
    }
    seen.add(task.id)
    return true
  })
}

export default function Calendar() {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateRecurringTask, setShowCreateRecurringTask] = useState(false)
  const [includeMyTasks, setIncludeMyTasks] = useState(false)
  const navigate = useNavigate()
  
  const { tasks, loading: tasksLoading, updateTask, createTask } = useFirebaseTasks()
  const { teamTasks, loading: teamTasksLoading } = useFirebaseTeamHierarchyTasks()
  const { teamMembers, loading: teamMembersLoading } = useFirebaseTeamMembers()
  const { profile, isManager } = useFirebaseProfile()
  const { projects, loading: projectsLoading } = useFirebaseProjects()

  console.log('Calendar - tasks:', tasks)
  console.log('Calendar - teamTasks:', teamTasks)
  console.log('Calendar - projects:', projects)
  console.log('Calendar - tasksLoading:', tasksLoading)
  console.log('Calendar - projectsLoading:', projectsLoading)

  // Convert projects to calendar events (similar to tasks)
  const projectEvents = projects
    .filter(project => project.due_date) // Only projects with due dates
    .map(project => ({
      id: `project-${project.id}`,
      title: project.title,
      dueDate: project.due_date,
      type: 'project' as const,
      status: project.status,
      priority: 5, // Default priority for projects
      projectId: project.id,
      isRecurring: false,
      assigneeIds: project.assigneeIds || [],
      description: project.description,
      // Add project-specific styling
      isProject: true
    }))

  const handleTaskClick = (task: any) => {
    if (task.isProject) {
      navigate(`/projects/${task.projectId}`)
    } else {
      navigate(`/tasks/${task.id}`)
    }
  }

  const handleTaskUpdate = async (taskData: any) => {
    await updateTask(taskData)
  }

  const handleCreateRecurringTasks = async (tasksData: any[]) => {
    for (const taskData of tasksData) {
      await createTask(taskData)
    }
  }

  const loading = tasksLoading || teamTasksLoading || teamMembersLoading || projectsLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show both personal and team calendar for managers
  if (isManager) {
    return (
      <div className="p-6 space-y-6">
        {/* Task Notifications */}
        <TaskNotifications tasks={deduplicateTasks([...tasks, ...teamTasks, ...projectEvents])} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              View your tasks and team tasks with due dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Button variant="outline" onClick={() => setShowCreateRecurringTask(true)}>
              <Repeat className="h-4 w-4 mr-2" />
              Recurring Task
            </Button>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              My Calendar
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Calendar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <CalendarWithVirtualInstances 
              teamMode={false}
            />
          </TabsContent>
          
          <TabsContent value="team">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeMyTasks}
                  onChange={(e) => setIncludeMyTasks(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include my tasks</span>
              </label>
            </div>
            <CalendarWithVirtualInstances 
              teamMode={true}
              teamMembers={teamMembers}
            />
          </TabsContent>
        </Tabs>

        {/* Create Task Dialogs */}
        <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
        <CreateRecurringTaskDialog open={showCreateRecurringTask} onOpenChange={setShowCreateRecurringTask} />
      </div>
    )
  }

  // Show only personal calendar for non-managers
  return (
    <div className="p-6 space-y-6">
      {/* Task Notifications */}
      <TaskNotifications tasks={deduplicateTasks([...tasks, ...projectEvents])} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground">
            View your tasks with due dates in calendar format
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
          <Button variant="outline" onClick={() => setShowCreateRecurringTask(true)}>
            <Repeat className="h-4 w-4 mr-2" />
            Recurring Task
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <CalendarWithVirtualInstances 
        teamMode={false}
      />

      {/* Create Task Dialogs */}
      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
      <CreateRecurringTaskDialog open={showCreateRecurringTask} onOpenChange={setShowCreateRecurringTask} />
    </div>
  )
}