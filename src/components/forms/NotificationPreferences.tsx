import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, MessageSquare, AtSign, Calendar, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/FirebaseAuthContext'

interface NotificationPreferences {
  // Task notifications
  taskAssigned: boolean
  taskCompleted: boolean
  taskOverdue: boolean
  taskDueSoon: boolean
  
  // Comment notifications
  commentAdded: boolean
  mentionedInComment: boolean
  
  // Project notifications
  projectAssigned: boolean
  projectCompleted: boolean
  
  // Meeting notifications
  meetingScheduled: boolean
  meetingReminder: boolean
  
  // System notifications
  systemUpdates: boolean
  securityAlerts: boolean
  
  // Notification channels
  emailNotifications: boolean
  inAppNotifications: boolean
  pushNotifications: boolean
}

const defaultPreferences: NotificationPreferences = {
  taskAssigned: true,
  taskCompleted: true,
  taskOverdue: true,
  taskDueSoon: true,
  commentAdded: true,
  mentionedInComment: true,
  projectAssigned: true,
  projectCompleted: false,
  meetingScheduled: true,
  meetingReminder: true,
  systemUpdates: false,
  securityAlerts: true,
  emailNotifications: true,
  inAppNotifications: true,
  pushNotifications: false
}

export const NotificationPreferences = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load user preferences from Firebase
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return
    
    // TODO: Load from Firebase user document
    // For now, use default preferences
    setPreferences(defaultPreferences)
  }

  const savePreferences = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // TODO: Save to Firebase user document
      console.log('Saving notification preferences:', preferences)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
      // TODO: Show success toast
    } catch (error) {
      console.error('Error saving preferences:', error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <Calendar className="h-4 w-4" />
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      case 'mention':
        return <AtSign className="h-4 w-4" />
      case 'meeting':
        return <Calendar className="h-4 w-4" />
      case 'system':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Choose how you want to be notified about activities in Task Flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button 
            onClick={savePreferences} 
            disabled={!hasChanges || isLoading}
            size="sm"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Task Notifications */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {getNotificationIcon('task')}
            Task Notifications
          </CardTitle>
          <CardDescription>
            Manage notifications related to your tasks and assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskAssigned">Task Assigned</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you're assigned to a task
              </p>
            </div>
            <Switch
              id="taskAssigned"
              checked={preferences.taskAssigned}
              onCheckedChange={(checked) => updatePreference('taskAssigned', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskCompleted">Task Completed</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a task you're involved with is completed
              </p>
            </div>
            <Switch
              id="taskCompleted"
              checked={preferences.taskCompleted}
              onCheckedChange={(checked) => updatePreference('taskCompleted', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskOverdue">Task Overdue</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when tasks become overdue
              </p>
            </div>
            <Switch
              id="taskOverdue"
              checked={preferences.taskOverdue}
              onCheckedChange={(checked) => updatePreference('taskOverdue', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskDueSoon">Task Due Soon</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when tasks are due soon
              </p>
            </div>
            <Switch
              id="taskDueSoon"
              checked={preferences.taskDueSoon}
              onCheckedChange={(checked) => updatePreference('taskDueSoon', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Comment Notifications */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {getNotificationIcon('comment')}
            Comment Notifications
          </CardTitle>
          <CardDescription>
            Control notifications for comments and mentions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="commentAdded">New Comments</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when comments are added to tasks/projects you're involved with
              </p>
            </div>
            <Switch
              id="commentAdded"
              checked={preferences.commentAdded}
              onCheckedChange={(checked) => updatePreference('commentAdded', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentionedInComment">Mentioned in Comments</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you (@username) in a comment
              </p>
            </div>
            <Switch
              id="mentionedInComment"
              checked={preferences.mentionedInComment}
              onCheckedChange={(checked) => updatePreference('mentionedInComment', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Notifications */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {getNotificationIcon('task')}
            Project Notifications
          </CardTitle>
          <CardDescription>
            Stay updated on project-related activities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="projectAssigned">Project Assigned</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you're assigned to a project
              </p>
            </div>
            <Switch
              id="projectAssigned"
              checked={preferences.projectAssigned}
              onCheckedChange={(checked) => updatePreference('projectAssigned', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="projectCompleted">Project Completed</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when projects you're involved with are completed
              </p>
            </div>
            <Switch
              id="projectCompleted"
              checked={preferences.projectCompleted}
              onCheckedChange={(checked) => updatePreference('projectCompleted', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Notifications */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {getNotificationIcon('meeting')}
            Meeting Notifications
          </CardTitle>
          <CardDescription>
            Manage meeting and schedule-related notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meetingScheduled">Meeting Scheduled</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when meetings are scheduled
              </p>
            </div>
            <Switch
              id="meetingScheduled"
              checked={preferences.meetingScheduled}
              onCheckedChange={(checked) => updatePreference('meetingScheduled', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meetingReminder">Meeting Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming meetings
              </p>
            </div>
            <Switch
              id="meetingReminder"
              checked={preferences.meetingReminder}
              onCheckedChange={(checked) => updatePreference('meetingReminder', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {getNotificationIcon('system')}
            System Notifications
          </CardTitle>
          <CardDescription>
            Important system updates and security alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="systemUpdates">System Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about system updates and new features
              </p>
            </div>
            <Switch
              id="systemUpdates"
              checked={preferences.systemUpdates}
              onCheckedChange={(checked) => updatePreference('systemUpdates', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="securityAlerts">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about security-related events
              </p>
            </div>
            <Switch
              id="securityAlerts"
              checked={preferences.securityAlerts}
              onCheckedChange={(checked) => updatePreference('securityAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card className="border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={preferences.inAppNotifications}
              onCheckedChange={(checked) => updatePreference('inAppNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <div className="text-sm text-muted-foreground">
          Changes are saved automatically
        </div>
      </div>
    </div>
  )
}

