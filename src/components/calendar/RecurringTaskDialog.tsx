import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Repeat, Plus } from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'

interface RecurringTaskDialogProps {
  onCreateRecurringTasks: (tasks: any[]) => void
}

export const RecurringTaskDialog: React.FC<RecurringTaskDialogProps> = ({
  onCreateRecurringTasks,
}) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_time: '09:00',
    recurrence_type: 'daily' as 'daily' | 'weekly' | 'monthly',
    recurrence_count: 7,
    start_date: new Date(),
    include_weekends: true,
  })

  const handleCreate = () => {
    const tasks = []
    let currentDate = new Date(formData.start_date)

    for (let i = 0; i < formData.recurrence_count; i++) {
      // Skip weekends if not included
      if (!formData.include_weekends && formData.recurrence_type === 'daily') {
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate = addDays(currentDate, 1)
        }
      }

      const dueDateTime = new Date(`${format(currentDate, 'yyyy-MM-dd')}T${formData.due_time}:00`)

      tasks.push({
        title: `${formData.title} (${i + 1}/${formData.recurrence_count})`,
        description: formData.description,
        priority: formData.priority,
        status: 'todo',
        due_date: dueDateTime.toISOString(),
      })

      // Calculate next date based on recurrence type
      switch (formData.recurrence_type) {
        case 'daily':
          currentDate = addDays(currentDate, 1)
          break
        case 'weekly':
          currentDate = addWeeks(currentDate, 1)
          break
        case 'monthly':
          currentDate = addMonths(currentDate, 1)
          break
      }
    }

    onCreateRecurringTasks(tasks)
    setOpen(false)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_time: '09:00',
      recurrence_type: 'daily',
      recurrence_count: 7,
      start_date: new Date(),
      include_weekends: true,
    })
  }

  const getRecurrencePreview = () => {
    const startDate = formData.start_date
    let endDate = new Date(startDate)
    
    switch (formData.recurrence_type) {
      case 'daily':
        endDate = addDays(startDate, formData.recurrence_count - 1)
        break
      case 'weekly':
        endDate = addWeeks(startDate, formData.recurrence_count - 1)
        break
      case 'monthly':
        endDate = addMonths(startDate, formData.recurrence_count - 1)
        break
    }

    return `${formData.recurrence_count} tasks from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Create Recurring Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Create Recurring Tasks
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Preview: {getRecurrencePreview()}
            </Badge>
          </div>

          {/* Task Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title Template</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Daily standup meeting"
              />
              <p className="text-xs text-muted-foreground">
                Each task will be numbered automatically (e.g., "Daily standup meeting (1/7)")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_time">Due Time</Label>
                <Input
                  id="due_time"
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Recurrence Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurrence_type">Frequency</Label>
                <Select value={formData.recurrence_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurrence_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence_count">Number of Tasks</Label>
                <Input
                  id="recurrence_count"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.recurrence_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence_count: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {formData.recurrence_type === 'daily' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_weekends"
                  checked={formData.include_weekends}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_weekends: checked }))}
                />
                <Label htmlFor="include_weekends">Include weekends</Label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.title.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Create {formData.recurrence_count} Tasks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}