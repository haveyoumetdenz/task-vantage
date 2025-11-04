import React from 'react'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useStaticVirtualInstances } from '@/hooks/useStaticVirtualInstances'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, addDays } from 'date-fns'
import { Repeat, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export const RecurringTaskSummary: React.FC = () => {
  const { tasks } = useFirebaseTasks()
  
  // Get virtual instances for the next 30 days
  const startDate = new Date()
  const endDate = addDays(startDate, 30)
  const { virtualInstances } = useStaticVirtualInstances(tasks, startDate, endDate)
  
  const recurringTasks = tasks.filter(task => task.isRecurring)
  
  const getStatusCounts = () => {
    const counts = {
      todo: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    }
    
    virtualInstances.forEach(instance => {
      counts[instance.status]++
    })
    
    return counts
  }
  
  const statusCounts = getStatusCounts()
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurring Tasks Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recurringTasks.length}</div>
              <div className="text-sm text-muted-foreground">Recurring Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.in_progress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.todo}</div>
              <div className="text-sm text-muted-foreground">Todo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Instances (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {virtualInstances.slice(0, 10).map(instance => (
              <div key={instance.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(instance.status)}
                  <span className="font-medium">{instance.title}</span>
                  <Repeat className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {instance.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(instance.dueDate), 'MMM d')}
                  </span>
                </div>
              </div>
            ))}
            {virtualInstances.length > 10 && (
              <div className="text-center text-sm text-muted-foreground">
                ... and {virtualInstances.length - 10} more instances
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}