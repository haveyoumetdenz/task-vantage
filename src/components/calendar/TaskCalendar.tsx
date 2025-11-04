import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Bell,
  Repeat,
  Grip
} from 'lucide-react'
import { Task } from '@/hooks/useFirebaseTasks'
import { TeamTask } from '@/hooks/useFirebaseTeamHierarchyTasks'
import { TeamMember } from '@/hooks/useFirebaseTeamMembers'
import { getDeadlineInfo } from '@/utils/deadlines'
import { useStaticVirtualInstances } from '@/hooks/useStaticVirtualInstances'
import { StaticVirtualInstance } from '@/hooks/useStaticVirtualInstances'
import { QuickEditTaskModal } from './QuickEditTaskModal'
import { TaskNotifications } from './TaskNotifications'
import { RecurringTaskDialog } from './RecurringTaskDialog'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  isToday,
  parseISO,
  differenceInDays
} from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskCalendarProps {
  tasks: Task[] | TeamTask[]
  onTaskClick: (task: Task | TeamTask) => void
  onTaskUpdate?: (taskData: any) => void
  onCreateRecurringTasks?: (tasks: any[]) => void
  teamMode?: boolean
  teamMembers?: TeamMember[]
}

type CalendarView = 'day' | 'week' | 'month'

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ 
  tasks, 
  onTaskClick, 
  onTaskUpdate,
  onCreateRecurringTasks,
  teamMode = false, 
  teamMembers = [] 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [quickEditTask, setQuickEditTask] = useState<Task | TeamTask | null>(null)
  const [showQuickEdit, setShowQuickEdit] = useState(false)

  // Calculate date range for virtual instances
  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    
    switch (view) {
      case 'month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      case 'week':
        start.setDate(start.getDate() - start.getDay())
        end.setDate(start.getDate() + 6)
        break
      case 'day':
        // Same day for start and end
        break
    }
    
    return { start, end }
  }

  const { start: startDate, end: endDate } = getDateRange()
  const { virtualInstances, updateInstance, loading: virtualInstancesLoading } = useStaticVirtualInstances(tasks, startDate, endDate)

  // Helper function to determine task urgency - simplified to always return normal
  const getTaskUrgency = (task: Task | TeamTask) => {
    return 'normal'
  }

  // Filter tasks that have due dates OR are recurring, and by selected member
  const tasksWithDueDates = tasks.filter(task => {
    // Exclude completed and cancelled tasks
    if (task.status === 'completed' || task.status === 'cancelled') return false
    
    // Include tasks with due dates OR recurring tasks (even without due dates)
    if (!task.dueDate && !task.isRecurring) return false
    if (teamMode && selectedMember !== 'all') {
      return task.userId === selectedMember
    }
    return true
  })

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination || !onTaskUpdate) return

    const taskId = result.draggableId
    const newDateString = result.destination.droppableId
    
    const task = tasksWithDueDates.find(t => t.id === taskId)
    if (!task) return

    // Parse the new date and maintain the original time
    const originalTime = task.dueDate ? format(parseISO(task.dueDate), 'HH:mm') : '09:00'
    const newDueDate = new Date(`${newDateString}T${originalTime}:00`)

    onTaskUpdate({
      id: taskId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: newDueDate.toISOString(),
    })
  }

  // Handle virtual instance updates
  const handleVirtualInstanceUpdate = async (instance: StaticVirtualInstance, updates: Partial<Task>) => {
    try {
      // Safety check for undefined dueDate
      if (!instance.dueDate) {
        console.error('Cannot update virtual instance: missing dueDate', instance)
        return
      }
      await updateInstance(instance.parentTaskId, format(parseISO(instance.dueDate), 'yyyy-MM-dd'), updates)
    } catch (error) {
      console.error('Error updating virtual instance:', error)
    }
  }

  // Handle task click with quick edit option
  const handleTaskItemClick = (task: Task | TeamTask, event: React.MouseEvent) => {
    event.stopPropagation()
    
    // Check if this is a virtual instance
    const isVirtualInstance = 'parentTaskId' in task && task.parentTaskId
    
    if (isVirtualInstance) {
      // For virtual instances, always open quick edit modal to edit just this instance
      setQuickEditTask(task)
      setShowQuickEdit(true)
    } else {
      // For regular tasks, use the normal behavior
      if (event.ctrlKey || event.metaKey) {
        setQuickEditTask(task)
        setShowQuickEdit(true)
      } else {
        onTaskClick(task)
      }
    }
  }

  const handleQuickEditSave = (taskData: any) => {
    // Check if this is a virtual instance update
    if (taskData.isVirtualInstance && taskData.parentTaskId) {
      // Use the virtual instance update system
      handleVirtualInstanceUpdate(taskData, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.due_date,
      })
    } else {
      // Use the regular task update
      if (onTaskUpdate) {
        onTaskUpdate(taskData)
      }
    }
  }

  // Get tasks for a specific date (including virtual instances)
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Get regular tasks for this date
    const regularTasks = tasksWithDueDates.filter(task => {
      if (!task.dueDate) return false
      
      // For regular tasks, show on their due date
      if (!task.isRecurring) {
        return isSameDay(parseISO(task.dueDate), date)
      }
      
      return false
    })
    
    // Get virtual instances for this date
    const virtualTasksForDate = virtualInstances.filter(instance => {
      // Safety check for undefined dueDate
      if (!instance.dueDate) {
        console.warn('Virtual instance missing dueDate:', instance)
        return false
      }
      try {
        const instanceDate = format(parseISO(instance.dueDate), 'yyyy-MM-dd')
        return instanceDate === dateStr
      } catch (error) {
        console.error('Error parsing virtual instance dueDate:', instance.dueDate, error)
        return false
      }
    })
    
    // Combine regular tasks and virtual instances
    const allTasks = [...regularTasks, ...virtualTasksForDate]
    
    // Filter by selected member if in team mode
    if (teamMode && selectedMember !== 'all') {
      return allTasks.filter(task => {
        if ('userId' in task) {
          return task.userId === selectedMember
        }
        return false
      })
    }
    
    return allTasks
  }

  // Helper function to check if a date is a valid occurrence of a recurring task
  const isRecurringTaskOccurrence = (startDate: Date, checkDate: Date, frequency: string, interval: number, recurrence?: any) => {
    if (checkDate < startDate) return false
    
    // Check end date condition
    if (recurrence?.endDate) {
      const endDate = new Date(recurrence.endDate)
      if (checkDate > endDate) return false
    }
    
    // Check max occurrences condition
    if (recurrence?.maxOccurrences) {
      const occurrenceNumber = getOccurrenceNumber(startDate, checkDate, frequency, interval)
      if (occurrenceNumber > recurrence.maxOccurrences) return false
    }
    
    const diffInDays = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (frequency) {
      case 'daily':
        return diffInDays % interval === 0
      case 'weekly':
        return diffInDays % (interval * 7) === 0
      case 'monthly':
        // Simple monthly check - same day of month
        return checkDate.getDate() === startDate.getDate() && 
               Math.floor(diffInDays / 30) % interval === 0
      case 'yearly':
        // Simple yearly check - same month and day
        return checkDate.getMonth() === startDate.getMonth() && 
               checkDate.getDate() === startDate.getDate() &&
               Math.floor(diffInDays / 365) % interval === 0
      default:
        return false
    }
  }

  // Helper function to calculate which occurrence number this is
  const getOccurrenceNumber = (startDate: Date, checkDate: Date, frequency: string, interval: number): number => {
    const diffInDays = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (frequency) {
      case 'daily':
        return Math.floor(diffInDays / interval) + 1
      case 'weekly':
        return Math.floor(diffInDays / (interval * 7)) + 1
      case 'monthly':
        return Math.floor(diffInDays / (interval * 30)) + 1
      case 'yearly':
        return Math.floor(diffInDays / (interval * 365)) + 1
      default:
        return 1
    }
  }


  // Get tasks for current view period
  const getTasksForPeriod = () => {
    const start = view === 'day' ? currentDate :
                 view === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) :
                 startOfMonth(currentDate)
    const end = view === 'day' ? currentDate :
               view === 'week' ? endOfWeek(currentDate, { weekStartsOn: 1 }) :
               endOfMonth(currentDate)

    return tasksWithDueDates.filter(task => {
      // For recurring tasks, always include them - let getTasksForDate handle the occurrence logic
      if (task.isRecurring && task.recurrence) {
        return true
      }
      
      // For non-recurring tasks, check if due date is in period
      if (!task.dueDate) return false
      const taskDate = parseISO(task.dueDate)
      return taskDate >= start && taskDate <= end
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (view === 'day') return addDays(prev, direction === 'next' ? 1 : -1)
      if (view === 'week') return addWeeks(prev, direction === 'next' ? 1 : -1)
      return addMonths(prev, direction === 'next' ? 1 : -1)
    })
  }

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="grid grid-cols-7 gap-2 h-[500px]">
        {weekDays.map(day => {
          const dayTasks = getTasksForDate(day)
          return (
            <div key={day.toISOString()} className="border rounded-lg p-2 overflow-hidden">
              <div className={cn(
                "text-sm font-medium mb-2 text-center",
                isToday(day) && "text-primary font-bold"
              )}>
                <div>{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-lg",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1 overflow-y-auto">
                {dayTasks.map(task => {
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskItemClick(task, e)}
                      className={cn(
                        "p-1 text-xs rounded cursor-pointer hover:bg-muted/80 transition-colors",
                        task.isProject 
                          ? "bg-blue-100 border-l-2 border-blue-500" 
                          : "bg-blue-100 border-l-2 border-blue-500"
                      )}
                      style={{
                        backgroundColor: '#dbeafe',
                        borderLeft: '2px solid #3b82f6'
                      }}
                    >
                      <p className="font-medium truncate">
                        {task.isProject && "📁 "}{task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          variant={task.status === 'completed' ? 'secondary' : task.isProject ? 'default' : 'outline'} 
                          className={cn(
                            "text-xs",
                            task.isProject && "bg-blue-500 text-white"
                          )}
                        >
                          {task.isProject ? 'Project' : (task.status || 'todo').replace('_', ' ')}
                        </Badge>
                        {task.isRecurring && (
                          <Repeat className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
                {dayTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const DayView = () => {
    const dayTasks = getTasksForDate(currentDate)
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} due
          </p>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {dayTasks.length > 0 ? (
            dayTasks.map(task => {
              return (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskItemClick(task, e)}
                  className={cn(
                    "p-4 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                    "bg-blue-100 border-blue-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={task.status === 'completed' ? 'secondary' : 'outline'} 
                          className="text-xs"
                        >
                          {(task.status || 'todo').replace('_', ' ')}
                        </Badge>
                        {task.isRecurring && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recurring
                          </Badge>
                        )}
                        {deadlineInfo.badge && (
                          <Badge variant={deadlineInfo.badge.variant} className="text-xs">
                            {deadlineInfo.badge.text}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : deadlineInfo.status === 'overdue' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                    ) : deadlineInfo.status === 'due_soon' ? (
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No tasks due today
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const MonthView = () => {
    const tasksForMonth = getTasksForPeriod()
    
    // Create a map of dates to tasks for the month view
    const tasksByDate = tasksForMonth.reduce((acc, task) => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(task)
      }
      return acc
    }, {} as Record<string, Task[]>)

    return (
      <div className="w-full">
        {/* Custom monthly calendar with larger cells */}
        <div className="border rounded-lg bg-card">
          {/* Month header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
          </div>
          
          {/* Calendar grid */}
          <div className="p-2">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const monthStart = startOfMonth(currentDate)
                const monthEnd = endOfMonth(currentDate)
                const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
                const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
                const days = []
                
                let currentDay = calendarStart
                while (currentDay <= calendarEnd) {
                  days.push(new Date(currentDay))
                  currentDay = addDays(currentDay, 1)
                }
                
                return days.map(day => {
                  const isCurrentMonth = day >= monthStart && day <= monthEnd
                  const dayTasks = getTasksForDate(day)
                  const isDayToday = isToday(day)
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[120px] p-1 border border-border/50 rounded-md hover:bg-muted/30 transition-colors",
                        !isCurrentMonth && "opacity-40",
                        isDayToday && "bg-primary/5 border-primary/30"
                      )}
                    >
                      {/* Day number */}
                      <div className={cn(
                        "text-sm font-medium mb-1 flex items-center justify-center w-6 h-6 rounded-full",
                        isDayToday && "bg-primary text-primary-foreground"
                      )}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Tasks for this day */}
                      <div className="space-y-1 overflow-hidden">
                        {dayTasks.slice(0, 3).map(task => {
                          const teamTask = task as TeamTask
                          
                          // Generate color based on assignee name for consistent colors
                          const getAssigneeColor = (name: string) => {
                            const colors = [
                              'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
                              'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                              'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
                              'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
                              'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
                              'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
                            ]
                            const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
                            return colors[hash % colors.length]
                          }
                          
                          return (
                            <div
                              key={task.id}
                              onClick={() => onTaskClick(task)}
                              className={cn(
                                "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate flex items-center gap-1",
                                "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                              )}
                              title={`${task.title}${teamMode && teamTask.assigneeName ? ` (${teamTask.assigneeName})` : ''}`}
                            >
                              {teamMode && teamTask.assigneeName && (
                                <Avatar className="h-3 w-3 flex-shrink-0">
                                  <AvatarImage src={teamTask.assigneeAvatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {teamTask.assigneeName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span className="truncate">{task.title}</span>
                            </div>
                          )
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getViewTitle = () => {
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    }
    return format(currentDate, 'MMMM yyyy')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {teamMode ? <Users className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
            {teamMode ? 'Team Calendar' : 'My Calendar'}
          </CardTitle>
          <div className="flex items-center gap-3">
            {teamMode && teamMembers.length > 0 && (
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {member.fullName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{getViewTitle()}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {view === 'day' && <DayView />}
        {view === 'week' && <WeekView />}
        {view === 'month' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <MonthView />
          </DragDropContext>
        )}

        {/* Quick Edit Modal */}
        <QuickEditTaskModal
          task={quickEditTask}
          open={showQuickEdit}
          onOpenChange={setShowQuickEdit}
          onSave={handleQuickEditSave}
          onNavigateToDetail={onTaskClick}
        />
      </CardContent>
    </Card>
  )
}