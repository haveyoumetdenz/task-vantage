import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { useFirebaseProjects, CreateProjectData } from '@/hooks/useFirebaseProjects'
import { useFirebaseRBAC } from '@/hooks/useFirebaseRBAC'
import { useAuth } from '@/contexts/FirebaseAuthContext'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'archived']).default('active'),
  progress: z.number().min(0).max(100).default(0),
  due_date: z.date().optional(),
  assignee_ids: z.array(z.string()).min(1, 'At least one assignee is required'),
})

type CreateProjectFormData = z.infer<typeof createProjectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProject } = useFirebaseProjects()
  const { user } = useAuth()
  const { profile, getTeamManagers, isDirector, isSeniorManagement } = useFirebaseRBAC()

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
      progress: 0,
      assignee_ids: [],
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
          console.log('🔧 Pre-populating project assignees:', autoAssignees)
        } catch (error) {
          console.error('Error getting team managers for project pre-population:', error)
        }
      }
      
      form.setValue('assignee_ids', autoAssignees)
    }
  }, [open, user?.uid, profile, isDirector, isSeniorManagement, getTeamManagers, form])

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true)
    
    // Auto-assignment logic
    let finalAssigneeIds = data.assignee_ids || []
    
    // Always add the creator
    if (user?.uid && !finalAssigneeIds.includes(user.uid)) {
      finalAssigneeIds.push(user.uid)
      console.log('🔧 Auto-assigning creator to project:', user.uid)
    }
    
    // Add team managers (but not Directors/Senior Management)
    if (profile && !isDirector && !isSeniorManagement) {
      try {
        const teamManagers = getTeamManagers()
        console.log('🔧 Team managers to auto-assign to project:', teamManagers)
        
        teamManagers.forEach(managerId => {
          if (!finalAssigneeIds.includes(managerId)) {
            finalAssigneeIds.push(managerId)
            console.log('🔧 Auto-assigning team manager to project:', managerId)
          }
        })
      } catch (error) {
        console.error('Error getting team managers for project:', error)
      }
    } else {
      console.log('🔧 Skipping manager auto-assignment for Director/Senior Management project')
    }
    
    console.log('🔧 Final project assignee IDs:', finalAssigneeIds)
    
    const projectData: CreateProjectData = {
      title: data.title,
      description: data.description,
      status: data.status,
      progress: data.progress,
      dueDate: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : undefined,
      teamId: profile?.teamId, // Add the user's team ID
      assigneeIds: finalAssigneeIds,
    }

    const result = await createProject(projectData)
    
    if (result) {
      form.reset()
      onOpenChange(false)
    }
    
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track your progress and manage tasks.
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
                    <Input placeholder="Enter project title" {...field} />
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
                      placeholder="Enter project description (optional)" 
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="0"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignee_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
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
                        onSelect={field.onChange}
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
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}