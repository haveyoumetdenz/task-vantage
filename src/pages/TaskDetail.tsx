import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Flag, 
  User, 
  Edit3, 
  MoreHorizontal,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskAssigneeSelect } from '@/components/tasks/TaskAssigneeSelect'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { ActivityLog } from '@/components/tasks/ActivityLog'
import { EditRecurringTaskDialog } from '@/components/forms/EditRecurringTaskDialog'
import { useFirebaseTasks, Task } from '@/hooks/useFirebaseTasks'
import { useFirebaseTeamHierarchyTasks } from '@/hooks/useFirebaseTeamHierarchyTasks'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { useFirebaseUserProfiles } from '@/hooks/useFirebaseUserProfiles'
import { cn } from '@/lib/utils'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'
import { format } from 'date-fns'

const statusConfig = {
  todo: { label: "To Do", color: "bg-blue-500" },
  in_progress: { label: "In Progress", color: "bg-yellow-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
}

const getPriorityConfig = (priority: number) => {
  if (priority >= 8) return { label: `Priority ${priority}`, color: "text-red-600" }
  if (priority >= 6) return { label: `Priority ${priority}`, color: "text-orange-600" }
  if (priority >= 4) return { label: `Priority ${priority}`, color: "text-yellow-600" }
  return { label: `Priority ${priority}`, color: "text-green-600" }
}

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { tasks, updateTask } = useFirebaseTasks()
  const { teamTasks } = useFirebaseTeamHierarchyTasks()
  const { projects } = useFirebaseProjects()
  const { canEditTask, profile } = useFirebaseRBAC()
  
  const [task, setTask] = useState<Task | null>(null)
  
  // Fetch assignee profiles - only when task is available
  const { profiles: assigneeProfiles, loading: profilesLoading } = useFirebaseUserProfiles(
    task ? (task.assigneeIds || []) : []
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [showRecurringEditDialog, setShowRecurringEditDialog] = useState(false)
  
  // Check if user can edit this task
  const userCanEdit = task ? canEditTask(task.userId, profile?.teamId) : false
  
  useEffect(() => {
    // First try to find in regular tasks
    let foundTask = tasks.find(t => t.id === taskId)
    
    // If not found, try to find in team tasks
    if (!foundTask) {
      foundTask = teamTasks.find(t => t.id === taskId)
    }
    
    if (foundTask) {
      setTask(foundTask)
      setEditData({
        title: foundTask.title,
        description: foundTask.description,
        status: foundTask.status,
        priority: foundTask.priority,
        due_date: foundTask.dueDate,
        project_id: foundTask.project_id || 'no-project',
        assignee_ids: foundTask.assigneeIds || []
      })
    }
  }, [tasks, teamTasks, taskId])

  if (!task) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    console.log('TaskDetail handleSave called with editData:', editData)
    try {
      // Format due_date properly before sending to updateTask
      const formattedEditData = {
        ...editData,
        dueDate: editData.due_date, // Convert snake_case to camelCase
        projectId: editData.project_id === 'no-project' ? null : editData.project_id,
        assigneeIds: editData.assignee_ids
      }
      
      // Remove the old snake_case fields
      delete formattedEditData.due_date
      delete formattedEditData.project_id
      delete formattedEditData.assignee_ids

      console.log('About to call updateTask with formatted data:', formattedEditData)
      const result = await updateTask({
        id: task.id,
        ...formattedEditData
      })
      
      console.log('TaskDetail updateTask result:', result)
      if (result) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate,
      project_id: task.projectId || 'no-project',
      assignee_ids: task.assignees?.map(a => a.user_id) || []
    })
    setIsEditing(false)
  }

  const statusData = statusConfig[task.status as keyof typeof statusConfig]
  const priorityData = getPriorityConfig(task.priority)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold">Task Details</h1>
            <p className="text-muted-foreground">
              Created {task.createdAt ? format(new Date(task.createdAt), 'PPP') : 'Unknown date'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : userCanEdit ? (
            <Button variant="outline" onClick={() => {
              if (task?.isRecurring) {
                console.log('Opening recurring task edit dialog for task:', task.title)
                setShowRecurringEditDialog(true)
              } else {
                console.log('Opening regular task edit for task:', task?.title)
                setIsEditing(true)
              }
            }}>
              <Edit3 className="h-4 w-4 mr-2" />
              {task?.isRecurring ? 'Edit Recurring Task' : 'Edit Task'}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Edit3 className="h-4 w-4" />
              <span>Read Only</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Task Information</span>
                <div className="flex items-center gap-2">
                  <Badge className={statusData?.color}>
                    {statusData?.label}
                  </Badge>
                  {!userCanEdit && (
                    <Badge variant="outline" className="text-xs">
                      Read Only
                    </Badge>
                  )}
                  <Flag className={`h-4 w-4 ${priorityData?.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="mt-1"
                    disabled={!userCanEdit}
                  />
                ) : (
                  <p className="mt-1">{task.title}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1">{statusData?.label}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  {isEditing ? (
                    <Select value={editData.priority.toString()} onValueChange={(value) => setEditData({ ...editData, priority: parseInt(value) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Priority 1 (Lowest)</SelectItem>
                        <SelectItem value="2">Priority 2</SelectItem>
                        <SelectItem value="3">Priority 3</SelectItem>
                        <SelectItem value="4">Priority 4</SelectItem>
                        <SelectItem value="5">Priority 5 (Medium)</SelectItem>
                        <SelectItem value="6">Priority 6</SelectItem>
                        <SelectItem value="7">Priority 7</SelectItem>
                        <SelectItem value="8">Priority 8</SelectItem>
                        <SelectItem value="9">Priority 9</SelectItem>
                        <SelectItem value="10">Priority 10 (Highest)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1">{priorityData?.label}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Project</label>
                {isEditing ? (
                  <Select value={editData.project_id || 'no-project'} onValueChange={(value) => setEditData({ ...editData, project_id: value === 'no-project' ? null : value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-project">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1">
                    {task.projectId 
                      ? projects.find(p => p.id === task.projectId)?.title || 'Unknown Project'
                      : 'No Project'
                    }
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Assignees</label>
                {isEditing ? (
                  <TaskAssigneeSelect
                    value={editData.assignee_ids}
                    onChange={(value) => setEditData({ ...editData, assignee_ids: value })}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1">
                    {task.assigneeIds && task.assigneeIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {task.assigneeIds.map((assigneeId) => {
                          const assigneeProfile = assigneeProfiles.find(p => p.userId === assigneeId)
                          return (
                            <Badge key={assigneeId} variant="secondary">
                              {assigneeProfile ? assigneeProfile.fullName : assigneeId}
                            </Badge>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No assignees</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Due Date</label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "mt-1 w-full justify-start text-left font-normal",
                          !editData.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editData.due_date ? (
                          format(new Date(editData.due_date), 'PPP p')
                        ) : (
                          <span>Pick a due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editData.due_date ? new Date(editData.due_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Set time to end of day if no time specified
                            const dateTime = new Date(date);
                            if (editData.due_date) {
                              const currentDue = new Date(editData.due_date);
                              dateTime.setHours(currentDue.getHours(), currentDue.getMinutes());
                            } else {
                              dateTime.setHours(23, 59);
                            }
                            setEditData({ ...editData, due_date: dateTime.toISOString() });
                          } else {
                            setEditData({ ...editData, due_date: null });
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                ) : task.dueDate ? (
                  <p className="mt-1 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(task.dueDate), 'PPP p')}
                  </p>
                ) : (
                  <p className="mt-1 text-muted-foreground">No due date</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardContent className="pt-6">
              <SubtaskList taskId={task.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subtasks</span>
                <span className="font-medium">{task.subtask_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Assignees</span>
                <span className="font-medium">{task.assigneeIds?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium text-sm">
                  {task.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="font-medium text-sm">
                  {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, yyyy') : 'Unknown date'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityLog entityType="task" entityId={task.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recurring Task Edit Dialog */}
      <EditRecurringTaskDialog 
        open={showRecurringEditDialog} 
        onOpenChange={setShowRecurringEditDialog} 
        task={task} 
      />
    </div>
  )
}