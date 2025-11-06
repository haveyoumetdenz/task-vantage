import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDown, Repeat, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface RecurrenceSelectorProps {
  value?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    end_date?: Date
    max_occurrences?: number
  }
  onChange: (recurrence: RecurrenceSelectorProps['value']) => void
  disabled?: boolean
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export function RecurrenceSelector({ value, onChange, disabled = false }: RecurrenceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [endDate, setEndDate] = useState<Date | undefined>(
    value?.end_date || undefined
  )

  console.log('RecurrenceSelector value:', value)

  const handleFrequencyChange = (frequency: string) => {
    const newValue = {
      ...value,
      frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
      interval: value?.interval || 1,
    }
    console.log('Frequency changed:', newValue)
    onChange(newValue)
  }

  const handleIntervalChange = (interval: number) => {
    onChange({
      ...value,
      interval: Math.max(1, interval),
    })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    onChange({
      ...value,
      end_date: date,
      max_occurrences: undefined, // Clear max_occurrences when setting end_date
    })
  }

  const handleMaxOccurrencesChange = (maxOccurrences: number) => {
    setEndDate(undefined) // Clear end_date when setting max_occurrences
    onChange({
      ...value,
      max_occurrences: Math.max(1, maxOccurrences),
      end_date: undefined,
    })
  }

  const getRecurrenceText = () => {
    if (!value || !value.frequency) return 'No recurrence'
    
    const { frequency, interval } = value
    const intervalText = interval === 1 ? '' : `every ${interval} `
    
    return `Repeat ${intervalText}${frequency}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between min-h-[40px]"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Repeat className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{getRecurrenceText()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[90vw] sm:w-80 p-4" align="start" side="bottom">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Recurrence Settings</h4>
            <p className="text-sm text-muted-foreground">
              Set up automatic task repetition
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Repeat</Label>
              <Select
                value={value?.frequency || 'daily'}
                onValueChange={handleFrequencyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Every</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="number"
                  min="1"
                  value={value?.interval || 1}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20 min-w-[60px]"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {value?.frequency === 'daily' ? 'day(s)' :
                   value?.frequency === 'weekly' ? 'week(s)' :
                   value?.frequency === 'monthly' ? 'month(s)' :
                   value?.frequency === 'yearly' ? 'year(s)' :
                   'day(s)'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Condition *</Label>
              <RadioGroup
                value={endDate ? 'date' : value?.max_occurrences ? 'occurrences' : ''}
                onValueChange={(selected) => {
                  if (selected === 'date') {
                    // Set a default end date (30 days from now)
                    const defaultEndDate = new Date()
                    defaultEndDate.setDate(defaultEndDate.getDate() + 30)
                    setEndDate(defaultEndDate)
                    onChange({
                      ...value,
                      end_date: defaultEndDate,
                      max_occurrences: undefined, // Clear max_occurrences when selecting date
                    })
                  } else if (selected === 'occurrences') {
                    // Set a default max occurrences (10)
                    setEndDate(undefined) // Clear end_date when selecting occurrences
                    onChange({
                      ...value,
                      max_occurrences: 10,
                      end_date: undefined,
                    })
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="endDate" />
                    <Label htmlFor="endDate" className="text-sm cursor-pointer font-normal">
                      End by date
                    </Label>
                  </div>
                  
                  {endDate && (
                    <div className="ml-6">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(endDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occurrences" id="maxOccurrences" />
                    <Label htmlFor="maxOccurrences" className="text-sm cursor-pointer font-normal">
                      End after
                    </Label>
                  </div>
                  
                  {value?.max_occurrences && (
                    <div className="ml-6 flex items-center gap-2 flex-wrap">
                      <Input
                        type="number"
                        min="1"
                        value={value.max_occurrences}
                        onChange={(e) => handleMaxOccurrencesChange(parseInt(e.target.value) || 1)}
                        className="w-20 min-w-[60px]"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">occurrences</span>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
