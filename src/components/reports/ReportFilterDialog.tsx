import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  taskStatus: string[];
  priority: string[];
  projectIds: string[];
  includeCompleted: boolean;
  includeOverdue: boolean;
}

interface ReportFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

const taskStatuses = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "completed", label: "Completed" },
];

const priorities = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export function ReportFilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: ReportFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleResetFilters = () => {
    const resetFilters: ReportFilters = {
      taskStatus: [],
      priority: [],
      projectIds: [],
      includeCompleted: true,
      includeOverdue: true,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const updateTaskStatus = (statusId: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      taskStatus: checked 
        ? [...prev.taskStatus, statusId]
        : prev.taskStatus.filter(s => s !== statusId)
    }));
  };

  const updatePriority = (priorityId: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      priority: checked 
        ? [...prev.priority, priorityId]
        : prev.priority.filter(p => p !== priorityId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Reports
          </DialogTitle>
          <DialogDescription>
            Apply filters to customize your analytics view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !localFilters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDate ? (
                      format(localFilters.startDate, "PPP")
                    ) : (
                      "Start date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.startDate}
                    onSelect={(date) => setLocalFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !localFilters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDate ? (
                      format(localFilters.endDate, "PPP")
                    ) : (
                      "End date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.endDate}
                    onSelect={(date) => setLocalFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Task Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Task Status</Label>
            <div className="space-y-2">
              {taskStatuses.map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.id}
                    checked={localFilters.taskStatus.includes(status.id)}
                    onCheckedChange={(checked) => 
                      updateTaskStatus(status.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={status.id} className="text-sm font-normal">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={priority.id}
                    checked={localFilters.priority.includes(priority.id)}
                    onCheckedChange={(checked) => 
                      updatePriority(priority.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={priority.id} className="text-sm font-normal">
                    {priority.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCompleted"
                  checked={localFilters.includeCompleted}
                  onCheckedChange={(checked) => 
                    setLocalFilters(prev => ({ ...prev, includeCompleted: checked as boolean }))
                  }
                />
                <Label htmlFor="includeCompleted" className="text-sm font-normal">
                  Include completed tasks
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeOverdue"
                  checked={localFilters.includeOverdue}
                  onCheckedChange={(checked) => 
                    setLocalFilters(prev => ({ ...prev, includeOverdue: checked as boolean }))
                  }
                />
                <Label htmlFor="includeOverdue" className="text-sm font-normal">
                  Include overdue tasks
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button onClick={handleApplyFilters} className="bg-gradient-primary hover:opacity-90">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}