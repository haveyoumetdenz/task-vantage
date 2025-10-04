import React from 'react'
import { Check, ChevronsUpDown, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useFirebaseTeamMembers, TeamMember } from '@/hooks/useFirebaseTeamMembers'

interface TaskAssigneeSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export const TaskAssigneeSelect = ({ value, onChange, className }: TaskAssigneeSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const { teamMembers, loading } = useFirebaseTeamMembers()

  const selectedMembers = teamMembers.filter(member => value.includes(member.userId))
  const availableMembers = teamMembers.filter(member => !value.includes(member.userId))

  const handleSelect = (memberId: string) => {
    const newValue = value.includes(memberId)
      ? value.filter(id => id !== memberId)
      : [...value, memberId]
    onChange(newValue)
  }

  const handleRemove = (memberId: string) => {
    onChange(value.filter(id => id !== memberId))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading ? (
              'Loading team members...'
            ) : value.length > 0 ? (
              `${value.length} assignee${value.length > 1 ? 's' : ''} selected`
            ) : (
              'Select assignees...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandEmpty>No team members found.</CommandEmpty>
            <CommandGroup>
              {availableMembers.map((member) => (
                <CommandItem
                  key={member.userId}
                  value={member.fullName}
                  onSelect={() => handleSelect(member.userId)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {member.fullName?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{member.fullName}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value.includes(member.userId) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected assignees */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <Badge key={member.userId} variant="secondary" className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {member.fullName?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.fullName}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemove(member.userId)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}