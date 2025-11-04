import React from 'react'
import { StaticVirtualInstance } from '@/hooks/useStaticVirtualInstances'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { Repeat, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface SimpleVirtualInstanceCardProps {
  instance: StaticVirtualInstance
  onClick?: () => void
}

export const SimpleVirtualInstanceCard: React.FC<SimpleVirtualInstanceCardProps> = ({
  instance,
  onClick
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'in_progress':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'cancelled':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow bg-blue-50 border-blue-200 ${
        onClick ? 'hover:bg-blue-100' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-1">
          {getStatusIcon(instance.status)}
          <Repeat className="h-3 w-3 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{instance.title}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(instance.status)}`}
          >
            {instance.status.replace('_', ' ')}
          </Badge>
          
          <span className="text-xs text-muted-foreground">
            {format(parseISO(instance.dueDate), 'MMM d')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
