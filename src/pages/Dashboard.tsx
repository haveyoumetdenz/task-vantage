import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Calendar,
  Plus,
  FolderOpen,
  ListTodo,
  ArrowRight,
  CalendarDays
} from 'lucide-react'
import { CreateProjectDialog } from '@/components/forms/CreateProjectDialog'
import { CreateTaskDialog } from '@/components/forms/CreateTaskDialog'
import { CreateMeetingDialog } from '@/components/forms/CreateMeetingDialog'
import { TaskCalendar } from '@/components/calendar/TaskCalendar'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useFirebaseMeetings } from '@/hooks/useFirebaseMeetings'
import { format, isToday, isPast, isFuture } from 'date-fns'

export default function Dashboard() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)
  
  const navigate = useNavigate()
  const { projects, loading: projectsLoading } = useFirebaseProjects()
  const { tasks, loading: tasksLoading } = useFirebaseTasks()
  const { meetings, loading: meetingsLoading } = useFirebaseMeetings()

  // Calculate overview statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const tasksToday = tasks.filter(task => 
    task.due_date && isToday(new Date(task.due_date))
  ).length
  const overdueTasks = tasks.filter(task => 
    task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed'
  ).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const overviewCards = [
    {
      title: 'Total Tasks',
      value: totalTasks.toString(),
      description: `${completedTasks} completed`,
      icon: ListTodo,
      color: 'text-blue-600',
    },
    {
      title: 'Due Today',
      value: tasksToday.toString(),
      description: 'tasks due today',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Overdue',
      value: overdueTasks.toString(),
      description: 'tasks overdue',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      description: 'overall progress',
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]

  const recentProjects = projects.slice(0, 3)
  const recentTasks = tasks.slice(0, 5)
  const upcomingMeetings = meetings
    .filter(meeting => meeting.status === 'scheduled' && isFuture(new Date(meeting.meeting_date)))
    .slice(0, 3)

  const handleTaskClick = (task: any) => {
    navigate(`/tasks/${task.id}`)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'completed': 'secondary',
      'on_hold': 'outline',
      'archived': 'destructive'
    }
    return variants[status] || 'default'
  }

  const getTaskStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'todo': 'outline',
      'in_progress': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive'
    }
    return variants[status] || 'default'
  }

  const isLoading = projectsLoading || tasksLoading || meetingsLoading

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your tasks.</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)} className="bg-gradient-primary hover:opacity-90 shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => (
          <Card key={card.title} className="hover:shadow-medium transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Track your project progress</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{project.title}</h4>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    {project.due_date && (
                      <span>Due {format(new Date(project.due_date), 'MMM dd')}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No projects yet. Create your first project!</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your latest task activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <Link key={task.id} to="/tasks" className="block">
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        task.status === 'completed' ? 'bg-green-500' : 
                        task.status === 'in_progress' ? 'bg-blue-500' : 
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{task.title}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getTaskStatusBadge(task.status)} className="text-xs">
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due {format(new Date(task.due_date), 'MMM dd')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No tasks yet. Create your first task!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Calendar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  My Calendar
                </CardTitle>
                <CardDescription>Tasks with due dates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">
                  View Full Calendar <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskCalendar tasks={tasks} onTaskClick={handleTaskClick} />
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your scheduled meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meeting.meeting_date), 'MMM dd')} at {meeting.meeting_time}
                        {meeting.location && ` • ${meeting.location}`}
                      </p>
                    </div>
                    <Badge variant="outline">{meeting.duration}min</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setShowCreateTask(true)}
            >
              <ListTodo className="h-5 w-5" />
              Create Task
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setShowCreateProject(true)}
            >
              <FolderOpen className="h-5 w-5" />
              New Project
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setShowCreateMeeting(true)}
            >
              <Calendar className="h-5 w-5" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateProjectDialog open={showCreateProject} onOpenChange={setShowCreateProject} />
      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
      <CreateMeetingDialog open={showCreateMeeting} onOpenChange={setShowCreateMeeting} />
    </div>
  )
}