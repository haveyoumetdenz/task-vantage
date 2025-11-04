import React, { useState } from 'react'
import { Plus, Check, Clock, MoreHorizontal, Trash2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFirebaseSubtasks, Subtask } from '@/hooks/useFirebaseSubtasks'
import { format } from 'date-fns'

interface SubtaskListProps {
  taskId: string
}

const statusConfig = {
  open: { label: "Open", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500", icon: Clock },
  done: { label: "Done", color: "bg-green-500", icon: Check },
}

const SubtaskItem = ({ subtask, onStatusChange, onDelete }: {
  subtask: Subtask
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(subtask.title)
  
  const config = statusConfig[subtask.status as keyof typeof statusConfig]
  const StatusIcon = config?.icon || Clock

  const handleSave = () => {
    // TODO: Implement title editing
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setTitle(subtask.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <button
        onClick={() => {
          const nextStatus = subtask.status === 'done' ? 'open' : 
                           subtask.status === 'open' ? 'in_progress' : 'done'
          onStatusChange(subtask.id, nextStatus)
        }}
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          subtask.status === 'done' 
            ? "bg-green-500 border-green-500 text-white" 
            : subtask.status === 'in_progress'
            ? "bg-yellow-500 border-yellow-500 text-white"
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {subtask.status === 'done' && <Check className="w-3 h-3" />}
        {subtask.status === 'in_progress' && <Play className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-auto p-0 border-none focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <div
            className={cn(
              "cursor-pointer",
              subtask.status === 'done' && "line-through text-muted-foreground"
            )}
            onClick={() => setIsEditing(true)}
          >
            {subtask.title}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            <StatusIcon className="w-3 h-3 mr-1" />
            {config?.label}
          </Badge>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              <AvatarImage src={subtask.creator_profile?.avatar_url} />
              <AvatarFallback className="text-xs">
                {subtask.creator_profile?.full_name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span>{subtask.creator_profile?.full_name}</span>
            <span>•</span>
            <span>{subtask.createdAt ? format(new Date(subtask.createdAt), 'MMM dd') : 'Unknown date'}</span>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onStatusChange(subtask.id, 'open')}>
            Mark as Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange(subtask.id, 'in_progress')}>
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange(subtask.id, 'done')}>
            Mark as Done
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(subtask.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const SubtaskList = ({ taskId }: SubtaskListProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const { subtasks, loading, createSubtask, updateSubtask, deleteSubtask } = useFirebaseSubtasks(taskId)

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    const result = await createSubtask({
      title: newSubtaskTitle,
      status: 'open'
    })

    if (result) {
      setNewSubtaskTitle('')
      setShowAddForm(false)
    }
  }

  const handleStatusChange = async (subtaskId: string, status: string) => {
    await updateSubtask({
      id: subtaskId,
      status: status as 'open' | 'in_progress' | 'done'
    })
  }

  const handleDelete = async (subtaskId: string) => {
    await deleteSubtask(subtaskId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      setNewSubtaskTitle('')
      setShowAddForm(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading subtasks...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Subtasks</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Subtask
        </Button>
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}

        {showAddForm && (
          <div className="flex items-center gap-3 p-3 border border-dashed rounded-lg">
            <div className="w-5 h-5 rounded border-2 border-muted-foreground" />
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Enter subtask title..."
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newSubtaskTitle.trim()) {
                  setShowAddForm(false)
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
              Add
            </Button>
          </div>
        )}

        {subtasks.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No subtasks yet</p>
            <p className="text-sm">Break this task into smaller, manageable pieces</p>
          </div>
        )}
      </div>
    </div>
  )
}