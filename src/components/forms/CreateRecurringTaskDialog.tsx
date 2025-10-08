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
import { useFirebaseTasks, CreateTaskData } from '@/hooks/useFirebaseTasks'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'

const createRecurringTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
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

type CreateRecurringTaskFormData = z.infer<typeof createRecurringTaskSchema>

interface CreateRecurringTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

export const CreateRecurringTaskDialog = ({ 
  open, 
  onOpenChange, 
  defaultProjectId 
}: CreateRecurringTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createTask } = useFirebaseTasks()
  const { projects } = useFirebaseProjects()

  const form = useForm<CreateRecurringTaskFormData>({
    resolver: zodResolver(createRecurringTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 5,
      start_date: undefined,
      start_time: '09:00',
      end_date: undefined,
      end_time: '17:00',
      project_id: 'no-project',
      assignee_ids: [],
      recurrence: {
        frequency: 'daily',
        interval: 1,
        max_occurrences: undefined,
      },
    },
  })

  // Set default project when it changes
  useEffect(() => {
    if (defaultProjectId && defaultProjectId !== 'no-project') {
      form.setValue('project_id', defaultProjectId)
    }
  }, [defaultProjectId, form])

  const onSubmit = async (data: CreateRecurringTaskFormData) => {
    setIsSubmitting(true)
    
    console.log('Recurring task form data:', data)
    
    // Combine start date and time for the first occurrence
    const startDateTime = new Date(data.start_date)
    const [startHours, startMinutes] = data.start_time.split(':').map(Number)
    startDateTime.setHours(startHours, startMinutes, 0, 0)
    
    // Combine end date and time for the last occurrence
    const endDateTime = new Date(data.end_date)
    const [endHours, endMinutes] = data.end_time.split(':').map(Number)
    endDateTime.setHours(endHours, endMinutes, 0, 0)
    
    const taskData: CreateTaskData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: startDateTime.toISOString(), // Use start date as the due date for the first occurrence
      projectId: data.project_id && data.project_id !== 'no-project' ? data.project_id : undefined,
      assigneeIds: data.assignee_ids && data.assignee_ids.length > 0 ? data.assignee_ids : undefined,
      isRecurring: true,
      recurrence: {
        frequency: data.recurrence.frequency,
        interval: data.recurrence.interval,
        endDate: format(data.end_date, 'yyyy-MM-dd'), // Use the end date from the form
        ...(data.recurrence.max_occurrences && { maxOccurrences: data.recurrence.max_occurrences }),
      },
    }

    console.log('Recurring task data to create:', taskData)

    try {
      const result = await createTask(taskData)
      console.log('Create recurring task result:', result)
      
      if (result) {
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Create recurring task error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurring Task</DialogTitle>
          <DialogDescription>
            Create a task that automatically repeats at set intervals.
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
                  <FormLabel>Assignees (Optional)</FormLabel>
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

            {/* Start Date and Time - Required for Recurring Tasks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Task Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
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
                                <span>Pick start date</span>
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
                  name="start_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Time *</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
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
                                <span>Pick end date</span>
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
                  name="end_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Time *</FormLabel>
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
                Create Recurring Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
