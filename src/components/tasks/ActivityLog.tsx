import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseTeamMembers } from '@/hooks/useFirebaseTeamMembers'
import { format } from 'date-fns'
import { Send, MessageSquare, User, AtSign, Bell, ChevronDown } from 'lucide-react'
import { db } from '@/integrations/firebase/client'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'

// Function to send mention notifications
const sendMentionNotifications = async (mentionedUserIds: string[], activity: any) => {
  try {
    console.log('🔔 Creating mention notifications for:', mentionedUserIds)
    console.log('🔔 Activity data:', activity)
    
    const notifications = mentionedUserIds.map(userId => ({
      userId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${activity.userName} mentioned you in a comment`,
      entityType: activity.entityType,
      entityId: activity.entityId,
      activityId: activity.id,
      read: false,
      timestamp: serverTimestamp()
    }))
    
    console.log('🔔 Notification objects to create:', notifications)
    
    // Save notifications to Firebase
    for (const notification of notifications) {
      console.log('🔔 Creating notification for user:', notification.userId)
      const docRef = await addDoc(collection(db, 'notifications'), notification)
      console.log('✅ Notification created with ID:', docRef.id, 'for user:', notification.userId)
    }
  } catch (error) {
    console.error('❌ Error creating mention notifications:', error)
  }
}

interface ActivityItem {
  id: string
  type: 'comment' | 'status_change' | 'assignment' | 'creation' | 'completion'
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  mentions?: string[] // Array of user IDs mentioned
  metadata?: {
    oldValue?: string
    newValue?: string
    field?: string
  }
}

interface ActivityLogProps {
  entityType?: 'project' | 'task' | 'subtask'
  entityId?: string
  className?: string
}

export const ActivityLog = ({ entityType, entityId, className }: ActivityLogProps) => {
  const { user } = useAuth()
  const { teamMembers } = useFirebaseTeamMembers()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // @ auto-complete state
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch activities from Firebase
  useEffect(() => {
    if (!entityType || !entityId) {
      console.log('🔧 No entityType or entityId provided, skipping activity fetch')
      setActivities([])
      return
    }

    console.log('🔧 Fetching activities for:', { entityType, entityId })
    
    const activitiesRef = collection(db, 'activities')
    const q = query(
      activitiesRef,
      where('entityType', '==', entityType),
      where('entityId', '==', entityId),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ActivityItem[]
      
      console.log('🔧 Fetched activities from Firebase:', activitiesData)
      setActivities(activitiesData)
    }, (error) => {
      console.error('❌ Error fetching activities:', error)
      setActivities([])
    })

    return () => unsubscribe()
  }, [entityType, entityId])

  // Handle @ auto-complete
  const handleCommentChange = (value: string) => {
    setNewComment(value)
    
    // Check for @ mentions
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if we're still typing the mention (no space after @)
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt)
        setMentionPosition(lastAtIndex)
        setShowMentions(true)
        return
      }
    }
    
    setShowMentions(false)
  }

  const handleMentionSelect = (member: any) => {
    const beforeMention = newComment.substring(0, mentionPosition)
    const afterMention = newComment.substring(mentionPosition + 1 + mentionQuery.length)
    const newText = `${beforeMention}@${member.fullName} ${afterMention}`
    
    setNewComment(newText)
    setShowMentions(false)
    setMentionQuery('')
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !entityType || !entityId) {
      console.log('❌ Comment submission blocked:', { 
        hasComment: !!newComment.trim(), 
        hasUser: !!user,
        hasEntityType: !!entityType,
        hasEntityId: !!entityId,
        comment: newComment 
      })
      return
    }

    console.log('🔧 Submitting comment to Firebase:', newComment)
    setIsSubmitting(true)
    
    try {
      // Extract mentions from comment
      console.log('🔍 Extracting mentions from comment:', newComment)
      console.log('🔍 Available team members:', teamMembers.map(m => ({ userId: m.userId, fullName: m.fullName, email: m.email })))
      
      const mentionRegex = /@([^\s@]+)/g
      const mentions: string[] = []
      let match
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const mentionText = match[1]
        console.log('🔍 Found mention text:', mentionText)
        
        const mentionedUser = teamMembers.find(member => 
          member.fullName.toLowerCase().includes(mentionText.toLowerCase()) ||
          member.email.toLowerCase().includes(mentionText.toLowerCase()) ||
          member.fullName.toLowerCase().replace(/\s+/g, '').includes(mentionText.toLowerCase())
        )
        
        if (mentionedUser) {
          console.log('✅ Found mentioned user:', mentionedUser.fullName, mentionedUser.userId)
          mentions.push(mentionedUser.userId)
        } else {
          console.log('❌ No user found for mention:', mentionText)
        }
      }
      
      console.log('🔍 Final mentions array:', mentions)

      // Save to Firebase
      const activityData = {
        entityType,
        entityId,
        type: 'comment',
        userId: user.uid,
        userName: user.email || 'You',
        content: newComment,
        mentions,
        timestamp: serverTimestamp()
      }

      console.log('🔧 Saving activity to Firebase:', activityData)
      const savedActivityRef = await addDoc(collection(db, 'activities'), activityData)
      console.log('✅ Activity saved with ID:', savedActivityRef.id)
      setNewComment('')
      
      // Send notification to mentioned users
      if (mentions.length > 0) {
        console.log('🔧 Sending notifications to:', mentions)
        await sendMentionNotifications(mentions, { ...activityData, id: savedActivityRef.id })
      }
    } catch (error) {
      console.error('❌ Error saving activity to Firebase:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      case 'status_change':
        return <Badge className="h-4 w-4" />
      case 'assignment':
        return <User className="h-4 w-4" />
      case 'creation':
        return <Badge className="h-4 w-4" />
      case 'completion':
        return <Badge className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'comment':
        return 'text-blue-600'
      case 'status_change':
        return 'text-yellow-600'
      case 'assignment':
        return 'text-green-600'
      case 'creation':
        return 'text-purple-600'
      case 'completion':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatComment = (content: string) => {
    // Highlight mentions by matching against actual team member names
    let formattedContent = content
    
    // Get all team member names and create a regex pattern
    const teamMemberNames = teamMembers.map(member => member.fullName)
    console.log('🎨 Formatting comment with team member names:', teamMemberNames)
    
    // Sort by length (longest first) to match "Engineering 1 Director" before "Engineering"
    const sortedNames = teamMemberNames.sort((a, b) => b.length - a.length)
    console.log('🎨 Sorted names for highlighting:', sortedNames)
    
    // Create regex patterns for each team member name
    sortedNames.forEach(name => {
      // Escape special regex characters in the name
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Create regex that matches @ followed by the name (case insensitive)
      const regex = new RegExp(`@(${escapedName})`, 'gi')
      const beforeReplace = formattedContent
      formattedContent = formattedContent.replace(regex, '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>')
      
      if (beforeReplace !== formattedContent) {
        console.log('🎨 Highlighted mention for:', name)
      }
    })
    
    console.log('🎨 Final formatted content:', formattedContent)
    return formattedContent
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <Badge variant="secondary">{activities.length}</Badge>
        </div>
        
        {/* Add Comment Section */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Add a comment</span>
              </div>
              
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your comment... Use @username to mention someone"
                  value={newComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  className="min-h-[80px]"
                />
                
                {/* @ Auto-complete Dropdown */}
                {showMentions && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <Command>
                      <CommandList>
                        {teamMembers
                          .filter(member => 
                            member.fullName.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                            member.email.toLowerCase().includes(mentionQuery.toLowerCase())
                          )
                          .slice(0, 5) // Limit to 5 suggestions
                          .map(member => (
                            <CommandItem
                              key={member.userId}
                              onSelect={() => handleMentionSelect(member)}
                              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback>
                                  {member.fullName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{member.fullName}</span>
                                <span className="text-xs text-gray-500">{member.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        {teamMembers.filter(member => 
                          member.fullName.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(mentionQuery.toLowerCase())
                        ).length === 0 && (
                          <CommandEmpty>No team members found</CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Use @username to mention team members
                </div>
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No activity yet. Be the first to comment!
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback>
                      {activity.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.userName}</span>
                    <div className={`flex items-center gap-1 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(activity.timestamp, 'MMM d, h:mm a')}
                    </span>
                    {activity.mentions && activity.mentions.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <AtSign className="h-3 w-3 mr-1" />
                        {activity.mentions.length} mention{activity.mentions.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    {activity.type === 'comment' ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: formatComment(activity.content) 
                        }}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <span className="text-muted-foreground">{activity.content}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}