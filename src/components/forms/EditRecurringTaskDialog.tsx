import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Loader2, Clock } from 'lucide-react'
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
import { RecurrenceSelector } from '@/components/forms/RecurrenceSelector'
import { useFirebaseTasks, Task, UpdateTaskData } from '@/hooks/useFirebaseTasks'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'

const editRecurringTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  priority: z.number().min(1).max(10).default(5),
  start_date: z.date({
    required_error: 'Start date is required for recurring tasks',
  }),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.date({
    required_error: 'End date is required for recurring tasks',
  }),
  end_time: z.string().min(1, 'End time is required'),
  project_id: z.string().optional(),
  assignee_ids: z.array(z.string()).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    max_occurrences: z.number().min(1).optional(),
  }),
})

type EditRecurringTaskFormData = z.infer<typeof editRecurringTaskSchema>

interface EditRecurringTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export const EditRecurringTaskDialog = ({ open, onOpenChange, task }: EditRecurringTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateTask } = useFirebaseTasks()
  const { projects } = useFirebaseProjects()
  
  // Debug: Log when dialog opens
  console.log('EditRecurringTaskDialog rendered - open:', open, 'task:', task?.title, 'isRecurring:', task?.isRecurring)

  const form = useForm<EditRecurringTaskFormData>({
    resolver: zodResolver(editRecurringTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 5,
      due_date: undefined,
      due_time: '09:00',
      project_id: 'no-project',
      assignee_ids: [],
      recurrence: {
        frequency: 'daily',
        interval: 1,
        end_date: undefined,
        max_occurrences: undefined,
      },
    },
  })

  // Reset form when task changes
  useEffect(() => {
    if (task && open) {
      console.log('EditRecurringTaskDialog - task data:', task)
      console.log('EditRecurringTaskDialog - task.isRecurring:', task.isRecurring)
      console.log('EditRecurringTaskDialog - task.recurrence:', task.recurrence)
      
      // If task is recurring but has no recurrence data, this is a data inconsistency
      if (task.isRecurring && !task.recurrence) {
        console.warn('WARNING: Task is marked as recurring but has no recurrence data!')
        console.warn('This suggests the task was created before recurrence functionality was properly implemented')
      }
      
      // Parse due date and time
      let dueDate: Date | undefined
      let dueTime = '09:00'
      
      if (task.dueDate) {
        dueDate = new Date(task.dueDate)
        dueTime = format(dueDate, 'HH:mm')
      }
      
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 5,
        due_date: dueDate,
        due_time: dueTime,
        project_id: task.projectId || 'no-project',
        assignee_ids: task.assigneeIds || [],
        recurrence: task.recurrence ? {
          frequency: task.recurrence.frequency,
          interval: task.recurrence.interval,
          end_date: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
          max_occurrences: task.recurrence.maxOccurrences,
        } : {
          frequency: 'daily',
          interval: 1,
          end_date: undefined,
          max_occurrences: undefined,
        },
      })
    }
  }, [task, open, form])

  const onSubmit = async (data: EditRecurringTaskFormData) => {
    if (!task) return

    console.log('EditRecurringTaskDialog onSubmit called with:', data)
    setIsSubmitting(true)
    
    // Combine date and time
    const dueDateTime = new Date(data.due_date)
    const [hours, minutes] = data.due_time.split(':').map(Number)
    dueDateTime.setHours(hours, minutes, 0, 0)
    
    const taskData: UpdateTaskData = {
      id: task.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: dueDateTime.toISOString(),
      projectId: data.project_id && data.project_id !== 'no-project' ? data.project_id : null,
      assigneeIds: data.assignee_ids,
      isRecurring: true,
      recurrence: {
        frequency: data.recurrence.frequency,
        interval: data.recurrence.interval,
        ...(data.recurrence.end_date && { endDate: data.recurrence.end_date.toISOString() }),
        ...(data.recurrence.max_occurrences && { maxOccurrences: data.recurrence.max_occurrences }),
      },
    }

    console.log('About to call updateTask with:', taskData)
    const result = await updateTask(taskData)
    console.log('updateTask result:', result)
    
    if (result) {
      onOpenChange(false)
    }
    
    setIsSubmitting(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Task</DialogTitle>
          <DialogDescription>
            Update your recurring task details and recurrence settings.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
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
                      className="min-h-[80px]"
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date and Time - Required for Recurring Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
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
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Time *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurrence Settings */}
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Recurrence Settings</h3>
              </div>
              
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <FormControl>
                      <RecurrenceSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Recurring Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
