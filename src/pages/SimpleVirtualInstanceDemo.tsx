import React, { useState } from 'react'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'
import { useStaticVirtualInstances, StaticVirtualInstance } from '@/hooks/useStaticVirtualInstances'
import { SimpleVirtualInstanceCard } from '@/components/calendar/SimpleVirtualInstanceCard'
import { TaskInstanceEditor } from '@/components/tasks/TaskInstanceEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, addDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { Repeat, Calendar, Edit } from 'lucide-react'

export default function SimpleVirtualInstanceDemo() {
  const { tasks } = useFirebaseTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedInstance, setSelectedInstance] = useState<StaticVirtualInstance | null>(null)
  
  // Get virtual instances for the next 2 weeks
  const startDate = new Date()
  const endDate = addDays(startDate, 14)
  const { virtualInstances, updateInstance, loading } = useStaticVirtualInstances(tasks, startDate, endDate)
  
  const recurringTasks = tasks.filter(task => task.isRecurring)
  
  const handleInstanceUpdate = (instance: StaticVirtualInstance, updates: Partial<Task>) => {
    updateInstance(instance.parentTaskId, format(parseISO(instance.dueDate), 'yyyy-MM-dd'), updates)
    setSelectedInstance(null)
  }

  const getInstancesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return virtualInstances.filter(instance => 
      format(parseISO(instance.dueDate), 'yyyy-MM-dd') === dateStr
    )
  }

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate)
    const end = endOfWeek(selectedDate)
    return eachDayOfInterval({ start, end })
  }

  const weekDates = getWeekDates()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simple Virtual Instance Demo</h1>
        <p className="text-muted-foreground">
          A simplified virtual instance system without infinite loops
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Weekly Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading instances...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map(date => {
                  const instances = getInstancesForDate(date)
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  
                  return (
                    <div key={date.toISOString()} className="min-h-[120px]">
                      <div className={`text-center text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : 'text-muted-foreground'
                      }`}>
                        {format(date, 'EEE d')}
                      </div>
                      <div className="space-y-1">
                        {instances.map(instance => (
                          <SimpleVirtualInstanceCard
                            key={instance.id}
                            instance={instance}
                            onClick={() => setSelectedInstance(instance)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instance Editor Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Instance</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedInstance(null)}
              >
                Close
              </Button>
            </div>
            
            <TaskInstanceEditor
              instance={selectedInstance}
              onSave={handleInstanceUpdate}
              onCancel={() => setSelectedInstance(null)}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Virtual Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">✅ What's Working</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Virtual instances load without infinite loops</li>
                <li>• Click on any instance to edit it</li>
                <li>• Changes are saved locally</li>
                <li>• Weekly calendar view shows all instances</li>
                <li>• Each instance can be modified independently</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🔧 Next Steps</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Update Firestore rules for persistence</li>
                <li>• Integrate with your existing calendar</li>
                <li>• Add more recurrence patterns if needed</li>
                <li>• Customize the UI to match your app</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
