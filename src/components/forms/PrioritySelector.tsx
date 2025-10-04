import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react'

interface PrioritySelectorProps {
  value: number
  onChange: (priority: number) => void
  disabled?: boolean
}

const priorityConfig = {
  1: { label: 'Very Low', color: 'bg-gray-500', icon: AlertCircle },
  2: { label: 'Low', color: 'bg-blue-500', icon: AlertCircle },
  3: { label: 'Low', color: 'bg-blue-500', icon: AlertCircle },
  4: { label: 'Low-Medium', color: 'bg-cyan-500', icon: AlertCircle },
  5: { label: 'Medium', color: 'bg-yellow-500', icon: AlertCircle },
  6: { label: 'Medium-High', color: 'bg-orange-500', icon: AlertCircle },
  7: { label: 'High', color: 'bg-orange-500', icon: AlertTriangle },
  8: { label: 'High', color: 'bg-red-500', icon: AlertTriangle },
  9: { label: 'Very High', color: 'bg-red-600', icon: AlertOctagon },
  10: { label: 'Critical', color: 'bg-red-700', icon: AlertOctagon },
}

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  const [open, setOpen] = useState(false)
  
  const config = priorityConfig[value as keyof typeof priorityConfig] || priorityConfig[5]
  const PriorityIcon = config.icon

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  const getPriorityColor = (priority: number) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    return config?.color || 'bg-gray-500'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <span>{config.label}</span>
            <Badge variant="secondary" className="ml-1">
              {value}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Priority Level</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select a priority level from 1 (very low) to 10 (critical)
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[value]}
                onValueChange={handleSliderChange}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 (Very Low)</span>
              <span>10 (Critical)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Priority Scale:</h5>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(priorityConfig).map(([level, config]) => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <span>{level}: {config.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
