import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVirtualInstances } from '@/hooks/useVirtualInstances'
import { RecurringTaskSummary } from '@/components/tasks/RecurringTaskSummary'
import { Task } from '@/hooks/useFirebaseTasks'
import { VirtualInstance } from '@/utils/recurringTaskInstances'
import { format, addDays, addWeeks } from 'date-fns'

interface VirtualInstanceDemoProps {
  tasks: Task[]
}

export const VirtualInstanceDemo: React.FC<VirtualInstanceDemoProps> = ({ tasks }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Get virtual instances for the next 2 weeks
  const startDate = new Date()
  const endDate = addWeeks(startDate, 2)
  const { virtualInstances, updateInstance } = useVirtualInstances(tasks, startDate, endDate)
  
  const recurringTasks = tasks.filter(task => task.isRecurring)
  
  const handleInstanceUpdate = async (instance: VirtualInstance, updates: Partial<VirtualInstance>) => {
    try {
      await updateInstance(instance.parentTaskId, format(instance.dueDate, 'yyyy-MM-dd'), updates)
      console.log('Instance updated:', instance.id, updates)
    } catch (error) {
      console.error('Error updating instance:', error)
    }
  }
  
  const handleInstanceClick = (instance: VirtualInstance) => {
    console.log('Instance clicked:', instance)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Instance System Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            This demonstrates how recurring tasks are handled as individual instances
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Recurring Tasks ({recurringTasks.length})</h3>
              <p className="text-sm text-muted-foreground">
                These are the original recurring task templates
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Virtual Instances ({virtualInstances.length})</h3>
              <p className="text-sm text-muted-foreground">
                These are the individual instances generated from recurring tasks
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recurringTasks.map(task => (
              <RecurringTaskSummary
                key={task.id}
                task={task}
                onInstanceUpdate={handleInstanceUpdate}
                onInstanceClick={handleInstanceClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Virtual Instances by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(new Date(), i)
              const dateInstances = virtualInstances.filter(instance => 
                format(parseISO(instance.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              )
              
              return (
                <div key={date.toISOString()} className="flex items-center gap-4 p-2 border rounded">
                  <div className="w-24 text-sm font-medium">
                    {format(date, 'MMM d')}
                  </div>
                  <div className="flex-1">
                    {dateInstances.length > 0 ? (
                      <div className="flex gap-2">
                        {dateInstances.map(instance => (
                          <Badge 
                            key={instance.id} 
                            variant="outline"
                            className="text-xs"
                          >
                            {instance.title}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No instances</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



