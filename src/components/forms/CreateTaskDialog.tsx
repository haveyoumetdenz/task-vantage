import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { TaskAssigneeSelect } from '@/components/tasks/TaskAssigneeSelect'
import { PrioritySelector } from '@/components/forms/PrioritySelector'
import { useFirebaseTasks, CreateTaskData } from '@/hooks/useFirebaseTasks'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { useAuth } from '@/contexts/FirebaseAuthContext'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
  priority: z.number().min(1).max(10).default(5),
  due_date: z.date().optional(),
  due_time: z.string().optional(),
  project_id: z.string().optional(),
  assignee_ids: z.array(z.string()).min(1, 'At least one assignee is required'),
})

type CreateTaskFormData = z.infer<typeof createTaskSchema>

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

export const CreateTaskDialog = ({ open, onOpenChange, defaultProjectId }: CreateTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createTask } = useFirebaseTasks()
  const { projects } = useFirebaseProjects()
  const { user } = useAuth()
  const { profile, getTeamManagers, isDirector, isSeniorManagement } = useFirebaseRBAC()

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 5,
      project_id: defaultProjectId || 'no-project',
      assignee_ids: [],
      due_time: '23:59', // Default to end of day
    },
  })

  // Auto-populate assignees when form opens
  useEffect(() => {
    if (open && user?.uid) {
      let autoAssignees = [user.uid] // Always include creator
      
      // Add team managers (but not Directors/Senior Management)
      if (profile && !isDirector && !isSeniorManagement) {
        try {
          const teamManagers = getTeamManagers()
          autoAssignees = [...autoAssignees, ...teamManagers]
          console.log('🔧 Pre-populating assignees:', autoAssignees)
        } catch (error) {
          console.error('Error getting team managers for pre-population:', error)
        }
      }
      
      form.setValue('assignee_ids', autoAssignees)
    }
  }, [open, user?.uid, profile, isDirector, isSeniorManagement, getTeamManagers, form])

  // Reset form when defaultProjectId changes
  useEffect(() => {
    if (defaultProjectId) {
      form.setValue('project_id', defaultProjectId)
    }
  }, [defaultProjectId, form])

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true)
    
    console.log('Form data:', data)
    
    // Auto-assignment logic
    let finalAssigneeIds = data.assignee_ids || []
    
    // Always add the creator
    if (user?.uid && !finalAssigneeIds.includes(user.uid)) {
      finalAssigneeIds.push(user.uid)
      console.log('🔧 Auto-assigning creator:', user.uid)
    }
    
    // Add team managers (but not Directors/Senior Management)
    if (profile && !isDirector && !isSeniorManagement) {
      try {
        const teamManagers = getTeamManagers()
        console.log('🔧 Team managers to auto-assign:', teamManagers)
        
        teamManagers.forEach(managerId => {
          if (!finalAssigneeIds.includes(managerId)) {
            finalAssigneeIds.push(managerId)
            console.log('🔧 Auto-assigning team manager:', managerId)
          }
        })
      } catch (error) {
        console.error('Error getting team managers:', error)
      }
    } else {
      console.log('🔧 Skipping manager auto-assignment for Director/Senior Management')
    }
    
    console.log('🔧 Final assignee IDs:', finalAssigneeIds)
    
    // Combine date and time if both are provided
    let dueDate: string | undefined = undefined
    if (data.due_date) {
      const dateTime = new Date(data.due_date)
      if (data.due_time) {
        const [hours, minutes] = data.due_time.split(':')
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      } else {
        // Default to end of day if no time specified
        dateTime.setHours(23, 59, 0, 0)
      }
      dueDate = format(dateTime, 'yyyy-MM-dd HH:mm:ss')
    }
    
    const taskData: CreateTaskData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: dueDate,
      projectId: data.project_id && data.project_id !== 'no-project' ? data.project_id : undefined,
      assigneeIds: finalAssigneeIds,
    }

    console.log('Task data to create:', taskData)

    try {
      const result = await createTask(taskData)
      console.log('Create task result:', result)
      
      if (result) {
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
    
    setIsSubmitting(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
          <DialogDescription>
            Add a new task to track your work and manage your productivity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description (optional)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <PrioritySelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-project">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignee_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignees</FormLabel>
                  <FormControl>
                    <TaskAssigneeSelect
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Leave blank if there are no team members to assign
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve time if already set, otherwise use time from form or default to 23:59
                              const dateTime = new Date(date);
                              const currentTime = form.watch('due_time') || '23:59';
                              const [hours, minutes] = currentTime.split(':');
                              dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                              field.onChange(dateTime);
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_time"
                render={({ field }) => {
                  // Sync time value with date field if date is set
                  const dueDate = form.watch('due_date')
                  const currentTime = dueDate 
                    ? `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`
                    : field.value || '23:59'
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Time (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={currentTime}
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            // Update date field with new time
                            if (dueDate) {
                              const [hours, minutes] = e.target.value.split(':')
                              const newDate = new Date(dueDate)
                              newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
                              form.setValue('due_date', newDate)
                            }
                          }}
                          disabled={!dueDate}
                          placeholder="HH:MM"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>


            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}