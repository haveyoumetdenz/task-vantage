import React, { useState } from 'react'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useSimpleVirtualInstances, SimpleVirtualInstance } from '@/hooks/useSimpleVirtualInstances'
import { TaskInstanceEditor } from '@/components/tasks/TaskInstanceEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, addDays, parseISO } from 'date-fns'
import { Repeat } from 'lucide-react'

export default function VirtualInstanceDemo() {
  const { tasks } = useFirebaseTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Get virtual instances for the next 2 weeks
  const startDate = new Date()
  const endDate = addDays(startDate, 14)
  const { virtualInstances, updateInstance, loading } = useSimpleVirtualInstances(tasks, startDate, endDate)
  
  const recurringTasks = tasks.filter(task => task.isRecurring)
  
  const handleInstanceUpdate = async (instance: SimpleVirtualInstance, updates: Partial<Task>) => {
    try {
      console.log('Updating instance:', instance.id, 'with updates:', updates)
      updateInstance(instance.parentTaskId, format(parseISO(instance.dueDate), 'yyyy-MM-dd'), updates)
      console.log('Instance updated successfully!')
    } catch (error) {
      console.error('Error updating instance:', error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Virtual Instance Demo</h1>
        <p className="text-muted-foreground">
          This demonstrates how to modify individual recurring task instances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recurring Tasks Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Tasks ({recurringTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recurringTasks.map(task => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.recurrence?.frequency} • {task.recurrence?.interval} interval
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Virtual Instances */}
        <Card>
          <CardHeader>
            <CardTitle>Virtual Instances ({virtualInstances.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading instances...</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {virtualInstances.map(instance => (
                  <TaskInstanceEditor
                    key={instance.id}
                    instance={instance}
                    onSave={handleInstanceUpdate}
                    onCancel={() => {}}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Modify Individual Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Update Firestore Rules</h3>
              <p className="text-sm text-muted-foreground mb-2">
                First, you need to update your Firestore rules to allow access to the recurringOverrides collection.
              </p>
              <ol className="text-sm space-y-1 ml-4">
                <li>1. Go to Firebase Console → Firestore Database → Rules</li>
                <li>2. Copy the rules from <code>firestore.rules</code> file</li>
                <li>3. Paste and publish the rules</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Individual Instance Control</h3>
              <p className="text-sm text-muted-foreground">
                Each virtual instance can be modified independently:
              </p>
              <ul className="text-sm space-y-1 ml-4 mt-2">
                <li>• Change status (todo, in_progress, completed, cancelled)</li>
                <li>• Modify assignees for specific dates</li>
                <li>• Change due dates for individual instances</li>
                <li>• Update priority or description for specific instances</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Calendar Integration</h3>
              <p className="text-sm text-muted-foreground">
                In the calendar view, you'll see individual instances on their due dates. 
                Click on any instance to modify it without affecting other instances of the same recurring task.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

