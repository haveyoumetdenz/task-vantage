import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

interface ActivityLogProps {
  entityType?: 'project' | 'task' | 'subtask'
  entityId?: string
  className?: string
}

export const ActivityLog = ({ entityType, entityId, className }: ActivityLogProps) => {
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Activity Log</h3>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Activity log temporarily disabled during Firebase migration.
          </div>
        </div>
      </div>
    </div>
  )
}