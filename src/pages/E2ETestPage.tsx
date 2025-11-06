import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFirebaseTasks, CreateTaskData } from '@/hooks/useFirebaseTasks'
import { useFirebaseProjects, CreateProjectData } from '@/hooks/useFirebaseProjects'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle } from 'lucide-react'

// Show this page in development/test mode or when explicitly enabled
const isE2ETestMode = import.meta.env.DEV || import.meta.env.VITE_E2E_TEST_MODE === 'true'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
  priority: z.number().min(1).max(10).default(5),
  dueDate: z.string().optional(),
})

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'archived']).default('active'),
  dueDate: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>
type ProjectFormData = z.infer<typeof projectSchema>

export default function E2ETestPage() {
  const { createTask } = useFirebaseTasks()
  const { createProject } = useFirebaseProjects()
  const { toast } = useToast()
  
  const [taskResult, setTaskResult] = useState<{ success: boolean; message: string; taskId?: string } | null>(null)
  const [projectResult, setProjectResult] = useState<{ success: boolean; message: string; projectId?: string } | null>(null)

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 5,
      dueDate: '',
    },
  })

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
      dueDate: '',
    },
  })

  const onTaskSubmit = async (data: TaskFormData) => {
    try {
      setTaskResult(null)
      
      const taskData: CreateTaskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
        assigneeIds: [], // E2E tests can add assignees if needed
      }

      const taskId = await createTask(taskData)
      
      setTaskResult({
        success: true,
        message: `Task created successfully!`,
        taskId,
      })
      
      toast({
        title: 'Task Created',
        description: `Task "${data.title}" created successfully`,
      })

      // Reset form
      taskForm.reset()
    } catch (error: any) {
      setTaskResult({
        success: false,
        message: error.message || 'Failed to create task',
      })
    }
  }

  const onProjectSubmit = async (data: ProjectFormData) => {
    try {
      setProjectResult(null)
      
      const projectData: CreateProjectData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        dueDate: data.dueDate || undefined, // Use dueDate instead of due_date
        assigneeIds: [], // E2E tests can add assignees if needed
      }

      const result = await createProject(projectData)
      
      // createProject returns an object with id property, or null on error
      if (!result || !result.id) {
        throw new Error('Failed to create project - no ID returned')
      }
      
      setProjectResult({
        success: true,
        message: `Project created successfully!`,
        projectId: result.id,
      })
      
      toast({
        title: 'Project Created',
        description: `Project "${data.title}" created successfully`,
      })

      // Reset form
      projectForm.reset()
    } catch (error: any) {
      setProjectResult({
        success: false,
        message: error.message || 'Failed to create project',
      })
    }
  }

  // Hide this page in production (but allow in preview mode for E2E tests)
  // In production builds, isE2ETestMode will be false, but in preview mode it should work
  // For now, always show the page - we can add a more sophisticated check later if needed

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">E2E Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Direct forms for E2E testing - bypasses UI navigation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
            <CardDescription>Direct task creation form for E2E tests</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...taskForm}>
              <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4" data-testid="create-task-form">
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} data-testid="task-title-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task description (optional)" {...field} data-testid="task-description-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={taskForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="task-status-select">
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
                    control={taskForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                            data-testid="task-priority-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={taskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="task-due-date-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {taskResult && (
                  <div 
                    className={`p-3 rounded-md border ${taskResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    data-testid={taskResult.success ? 'task-created-success' : 'task-created-error'}
                  >
                    <div className="flex items-center gap-2">
                      {taskResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={taskResult.success ? 'text-green-800' : 'text-red-800'}>
                        {taskResult.message}
                        {taskResult.taskId && (
                          <span className="block text-xs mt-1" data-testid="task-created-id">Task ID: {taskResult.taskId}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" data-testid="create-task-submit">
                  Create Task
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Create Project Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>Direct project creation form for E2E tests</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4" data-testid="create-project-form">
                <FormField
                  control={projectForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} data-testid="project-title-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter project description (optional)" {...field} data-testid="project-description-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={projectForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="project-status-select">
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
                  control={projectForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="project-due-date-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {projectResult && (
                  <div 
                    className={`p-3 rounded-md border ${projectResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    data-testid={projectResult.success ? 'project-created-success' : 'project-created-error'}
                  >
                    <div className="flex items-center gap-2">
                      {projectResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={projectResult.success ? 'text-green-800' : 'text-red-800'}>
                        {projectResult.message}
                        {projectResult.projectId && (
                          <span className="block text-xs mt-1" data-testid="project-created-id">Project ID: {projectResult.projectId}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" data-testid="create-project-submit">
                  Create Project
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
