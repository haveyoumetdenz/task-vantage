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
import { RecurrenceSelector } from '@/components/forms/RecurrenceSelector'
import { Checkbox } from '@/components/ui/checkbox'
import { useFirebaseTasks, Task, UpdateTaskData } from '@/hooks/useFirebaseTasks'
import { useFirebaseProjects } from '@/hooks/useFirebaseProjects'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  priority: z.number().min(1).max(10).default(5),
  due_date: z.date().optional(),
  project_id: z.string().optional(),
  assignee_ids: z.array(z.string()).optional(),
  is_recurring: z.boolean().default(false),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    end_date: z.date().optional(),
    max_occurrences: z.number().min(1).optional(),
  }).optional(),
})

type EditTaskFormData = z.infer<typeof editTaskSchema>

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export const EditTaskDialog = ({ open, onOpenChange, task }: EditTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateTask } = useFirebaseTasks()
  const { projects } = useFirebaseProjects()
  const { canReassignTasks } = useFirebaseRBAC()

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 5,
      project_id: 'no-project',
      assignee_ids: [],
      is_recurring: false,
      recurrence: undefined,
    },
  })

  // Reset form when task changes
  useEffect(() => {
    if (task && open) {
      console.log('EditTaskDialog - task data:', task)
      console.log('EditTaskDialog - task.isRecurring:', task.isRecurring)
      console.log('EditTaskDialog - task.recurrence:', task.recurrence)
      
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 5,
        due_date: task.dueDate ? new Date(task.dueDate) : undefined,
        project_id: task.projectId || 'no-project',
        assignee_ids: task.assigneeIds || [],
        is_recurring: task.isRecurring || false,
        recurrence: task.recurrence ? {
          frequency: task.recurrence.frequency,
          interval: task.recurrence.interval,
          end_date: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
          max_occurrences: task.recurrence.maxOccurrences,
        } : undefined,
      })
    }
  }, [task, open, form])

  const onSubmit = async (data: EditTaskFormData) => {
    if (!task) return

    console.log('EditTaskDialog onSubmit called with:', data)
    setIsSubmitting(true)
    
    const taskData: UpdateTaskData = {
      id: task.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? data.due_date.toISOString() : null,
      projectId: data.project_id && data.project_id !== 'no-project' ? data.project_id : null,
      assigneeIds: data.assignee_ids,
      isRecurring: data.is_recurring,
      ...(data.recurrence && {
        recurrence: {
          frequency: data.recurrence.frequency,
          interval: data.recurrence.interval,
          ...(data.recurrence.end_date && { endDate: data.recurrence.end_date.toISOString() }),
          ...(data.recurrence.max_occurrences && { maxOccurrences: data.recurrence.max_occurrences }),
        }
      }),
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details, change status, assign to projects, and manage assignees.
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
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                        disabled={!canReassignTasks(task?.assigneeIds)}
                      />
                    </FormControl>
                    {!canReassignTasks(task?.assigneeIds) && (
                      <p className="text-xs text-muted-foreground">
                        Only assignees can reassign tasks.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
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
                            // Preserve existing time or set default
                            const dateTime = new Date(date);
                            if (field.value) {
                              const currentTime = new Date(field.value);
                              dateTime.setHours(currentTime.getHours(), currentTime.getMinutes());
                            } else {
                              dateTime.setHours(23, 59);
                            }
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

            {/* Recurrence Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Make this task recurring
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Automatically create new instances when completed
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('is_recurring') && (
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
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('Cancel button clicked')
                  onOpenChange(false)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={() => console.log('Update button clicked, form valid:', form.formState.isValid)}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}