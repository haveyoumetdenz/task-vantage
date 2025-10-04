import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/forms/CreateTaskDialog'
import { CreateRecurringTaskDialog } from '@/components/forms/CreateRecurringTaskDialog'
import { EditTaskDialog } from '@/components/forms/EditTaskDialog'
import { EditRecurringTaskDialog } from '@/components/forms/EditRecurringTaskDialog'
import { useFirebaseTasks, Task } from '@/hooks/useFirebaseTasks'
import { useFirebaseTeamHierarchyTasks } from '@/hooks/useFirebaseTeamHierarchyTasks'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseProfile } from '@/hooks/useFirebaseProfile'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  CheckSquare,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  List,
  Layout,
  Repeat,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { getDeadlineInfo } from '@/utils/deadlines'

const statusConfig = {
  todo: { label: "To Do", color: "bg-gray-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500", icon: CheckSquare },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckSquare },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: AlertTriangle },
}

const getPriorityConfig = (priority: number) => {
  if (priority >= 8) return { label: `Priority ${priority}`, color: "text-red-600" }
  if (priority >= 6) return { label: `Priority ${priority}`, color: "text-orange-600" }
  if (priority >= 4) return { label: `Priority ${priority}`, color: "text-yellow-600" }
  return { label: `Priority ${priority}`, color: "text-green-600" }
}

function TaskCard({ task, onClick, onEdit, onDelete }: { 
  task: Task; 
  onClick?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}) {
  const navigate = useNavigate()
  const StatusIcon = statusConfig[task.status as keyof typeof statusConfig]?.icon || Clock
  const deadlineInfo = getDeadlineInfo(task.dueDate, task.status, task.completedAt)
  
  return (
    <Card className={`hover:shadow-medium transition-all duration-300 cursor-pointer ${deadlineInfo.className}`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                navigate(`/tasks/${task.id}`)
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit?.(task)
              }}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig[task.status as keyof typeof statusConfig]?.label || task.status}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flag className={`h-3 w-3 ${getPriorityConfig(task.priority).color}`} />
              <span>{getPriorityConfig(task.priority).label}</span>
            </div>
            {task.isRecurring && (
              <div className="flex items-center gap-1">
                <Repeat className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600 text-xs">Recurring</span>
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${deadlineInfo.className}`}>
              <Calendar className="h-3 w-3" />
              <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, h:mm a') : 'No due date'}</span>
              {deadlineInfo.badge && (
                <Badge variant={deadlineInfo.badge.variant} className="ml-1 text-xs">
                  {deadlineInfo.badge.text}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Assignees */}
        {task.assigneeIds && task.assigneeIds.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {task.assigneeIds.slice(0, 3).map((assigneeId, index) => (
                <Avatar key={assigneeId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {assigneeId.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assigneeIds.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{task.assigneeIds.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {task.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy') : 'No date'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({ status, tasks, onTaskClick, onEditTask, onDeleteTask }: { 
  status: string; 
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { label: 'To Do', color: 'bg-gray-500' }
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-yellow-500' }
      case 'completed':
        return { label: 'Completed', color: 'bg-green-500' }
      default:
        return { label: status, color: 'bg-gray-500' }
    }
  }

  const statusConfig = getStatusConfig(status)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
        <h3 className="font-medium">{statusConfig.label}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task.id)}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  )
}

export default function Tasks() {
  const { tasks, loading, updateTask, deleteTask, migrateTasksMissingIsRecurring } = useFirebaseTasks()
  const { teamTasks, loading: hierarchyLoading } = useFirebaseTeamHierarchyTasks()
  const { canViewTeamWork } = useFirebaseRBAC()
  const { profile } = useFirebaseProfile()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createRecurringDialogOpen, setCreateRecurringDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editRecurringDialogOpen, setEditRecurringDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState('my')
  const [includeMyTasks, setIncludeMyTasks] = useState(false)

  if (loading || hierarchyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getFilteredTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      
      const matchesPriority = priorityFilter === 'all' || 
        (priorityFilter === '1-3' && task.priority >= 1 && task.priority <= 3) ||
        (priorityFilter === '4-6' && task.priority >= 4 && task.priority <= 6) ||
        (priorityFilter === '7-8' && task.priority >= 7 && task.priority <= 8) ||
        (priorityFilter === '9-10' && task.priority >= 9 && task.priority <= 10)
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const getTasksForCurrentView = () => {
    if (activeTab === 'my') {
      return tasks
    } else {
      // Convert TeamHierarchyTask to Task format for consistency
      const convertedTeamTasks = teamTasks.map(task => ({
        ...task,
        priority: typeof task.priority === 'string' ? parseInt(task.priority) || 5 : task.priority
      })) as Task[]
      return includeMyTasks ? [...convertedTeamTasks, ...tasks] : convertedTeamTasks
    }
  }

  const getQuickStats = (taskList: Task[]) => {
    const totalTasks = taskList.length
    const completedTasks = taskList.filter(task => task.status === 'completed').length
    const inProgressTasks = taskList.filter(task => task.status === 'in_progress').length
    const overdueTasks = taskList.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      return new Date(task.dueDate) < new Date()
    }).length

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks }
  }

  const currentTasks = getTasksForCurrentView()
  const { totalTasks, completedTasks, inProgressTasks, overdueTasks } = getQuickStats(getFilteredTasks(currentTasks))

  const renderTaskContent = (taskList: Task[]) => {
    return (
      <>
        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Layout className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
        </div>

        {/* Task Display */}
        {viewMode === 'list' ? (
          <div className="grid gap-4">
            {taskList.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </CardContent>
              </Card>
            ) : (
              taskList.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  onEdit={() => {
                    console.log('Edit task clicked:', task.title, 'isRecurring:', task.isRecurring)
                    console.log('Full task object:', task)
                    setSelectedTask(task)
                    if (task.isRecurring) {
                      console.log('Opening EditRecurringTaskDialog for recurring task')
                      setEditDialogOpen(false) // Ensure regular dialog is closed
                      setEditRecurringDialogOpen(true)
                    } else {
                      console.log('Opening EditTaskDialog for regular task')
                      setEditRecurringDialogOpen(false) // Ensure recurring dialog is closed
                      setEditDialogOpen(true)
                    }
                  }}
                  onDelete={() => deleteTask(task.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['todo', 'in_progress', 'completed'].map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={taskList.filter(task => task.status === status)}
                onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
                onEditTask={(task) => {
                  console.log('Edit task clicked (kanban):', task.title, 'isRecurring:', task.isRecurring)
                  setSelectedTask(task)
                  if (task.isRecurring) {
                    setEditDialogOpen(false) // Ensure regular dialog is closed
                    setEditRecurringDialogOpen(true)
                  } else {
                    setEditRecurringDialogOpen(false) // Ensure recurring dialog is closed
                    setEditDialogOpen(true)
                  }
                }}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your tasks {profile?.role && `(${profile.role})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline" onClick={() => setCreateRecurringDialogOpen(true)}>
            <Repeat className="h-4 w-4 mr-2" />
            Recurring Task
          </Button>
          <Button 
            variant="secondary" 
            onClick={migrateTasksMissingIsRecurring}
            className="text-xs"
          >
            Fix Data
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="1-3">Low (1-3)</SelectItem>
            <SelectItem value="4-6">Medium (4-6)</SelectItem>
            <SelectItem value="7-8">High (7-8)</SelectItem>
            <SelectItem value="9-10">Urgent (9-10)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTasks}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Management */}
      {canViewTeamWork ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my">My Tasks</TabsTrigger>
            <TabsTrigger value="team">Team Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="my" className="space-y-6">
            {renderTaskContent(getFilteredTasks(tasks))}
          </TabsContent>
          <TabsContent value="team" className="space-y-6">
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
            {renderTaskContent(getFilteredTasks(currentTasks))}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {renderTaskContent(getFilteredTasks(tasks))}
        </div>
      )}

      {/* Dialogs */}
      <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <CreateRecurringTaskDialog open={createRecurringDialogOpen} onOpenChange={setCreateRecurringDialogOpen} />
      <EditTaskDialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          console.log('EditTaskDialog onOpenChange:', open)
          setEditDialogOpen(open)
        }} 
        task={selectedTask} 
      />
      <EditRecurringTaskDialog 
        open={editRecurringDialogOpen} 
        onOpenChange={(open) => {
          console.log('EditRecurringTaskDialog onOpenChange:', open)
          setEditRecurringDialogOpen(open)
        }} 
        task={selectedTask} 
      />
    </div>
  )
}