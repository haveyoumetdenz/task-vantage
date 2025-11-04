import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VirtualInstance } from '@/utils/recurringTaskInstances'
import { CheckCircle, Clock, AlertTriangle, Repeat } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface RecurringTaskInstanceProps {
  instance: VirtualInstance
  onUpdate: (instance: VirtualInstance, updates: Partial<VirtualInstance>) => void
  onTaskClick?: (instance: VirtualInstance) => void
  compact?: boolean
}

export const RecurringTaskInstance: React.FC<RecurringTaskInstanceProps> = ({
  instance,
  onUpdate,
  onTaskClick,
  compact = false
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await onUpdate(instance, { status: newStatus as any })
    } catch (error) {
      console.error('Error updating instance status:', error)
    } finally {
      setIsUpdating(false)
    }
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

  if (compact) {
    return (
      <div 
        className="flex items-center gap-2 p-2 rounded-md bg-blue-100 border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
        onClick={() => onTaskClick?.(instance)}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {getStatusIcon(instance.status)}
          <span className="text-sm font-medium truncate">{instance.title}</span>
          <Repeat className="h-3 w-3 text-blue-600 flex-shrink-0" />
        </div>
        
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(instance.status)}`}
          >
            {instance.status.replace('_', ' ')}
          </Badge>
          
          <Select
            value={instance.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-20 h-6 text-xs">
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
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 truncate">{instance.title}</h3>
            <Repeat className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </div>
          
          {instance.description && (
            <p className="text-sm text-gray-600 mb-2">{instance.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Due: {format(parseISO(instance.dueDate), 'MMM d, yyyy')}</span>
            <span>•</span>
            <span>Priority: {instance.priority}/10</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(instance.status)}`}
          >
            {getStatusIcon(instance.status)}
            <span className="ml-1">{instance.status.replace('_', ' ')}</span>
          </Badge>
          
          <Select
            value={instance.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32">
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
      </div>
      
      {instance.assigneeIds && instance.assigneeIds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Assignees:</span> {instance.assigneeIds.length} assigned
          </div>
        </div>
      )}
    </div>
  )
}



