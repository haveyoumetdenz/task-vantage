import React, { useState } from 'react'
import { StaticVirtualInstance } from '@/hooks/useStaticVirtualInstances'
import { Task } from '@/hooks/useFirebaseTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format, parseISO } from 'date-fns'
import { CheckCircle, Clock, AlertTriangle, Save, X } from 'lucide-react'

interface TaskInstanceEditorProps {
  instance: StaticVirtualInstance
  onSave: (instance: StaticVirtualInstance, updates: Partial<Task>) => Promise<void>
  onCancel: () => void
}

export const TaskInstanceEditor: React.FC<TaskInstanceEditorProps> = ({
  instance,
  onSave,
  onCancel
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [updates, setUpdates] = useState<Partial<Task>>({
    status: instance.status,
    title: instance.title,
    description: instance.description || '',
    priority: instance.priority,
    assigneeIds: instance.assigneeIds
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(instance, updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving instance:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setUpdates({
      status: instance.status,
      title: instance.title,
      description: instance.description || '',
      priority: instance.priority,
      assigneeIds: instance.assigneeIds
    })
    setIsEditing(false)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon(updates.status)}
            {isEditing ? (
              <Input
                value={updates.title || ''}
                onChange={(e) => setUpdates({ ...updates, title: e.target.value })}
                className="text-lg font-semibold"
              />
            ) : (
              <span>{instance.title}</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Instance
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{format(parseISO(instance.dueDate), 'MMM d, yyyy')}</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(updates.status)}`}
          >
            {updates.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={updates.status}
                onValueChange={(value) => setUpdates({ ...updates, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={updates.description || ''}
                onChange={(e) => setUpdates({ ...updates, description: e.target.value })}
                placeholder="Task description..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="5"
                value={updates.priority || 1}
                onChange={(e) => setUpdates({ ...updates, priority: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {instance.description && (
              <p className="text-sm text-muted-foreground">{instance.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span>Priority: {instance.priority}</span>
              <span>Assignees: {instance.assigneeIds.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
