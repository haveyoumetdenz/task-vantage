import { differenceInDays, isPast, isValid } from 'date-fns';

export type DeadlineStatus = 'overdue' | 'due_soon' | 'normal' | 'completed';

export interface DeadlineInfo {
  status: DeadlineStatus;
  message: string;
  className: string;
  badge?: {
    text: string;
    variant: 'destructive' | 'warning' | 'secondary';
  };
}

/**
 * Determines the deadline status and styling for a task
 */
export function getDeadlineInfo(
  due_date: string | null | undefined,
  status: string,
  completed_at?: string | null
): DeadlineInfo {
  // If task is completed, show as completed (greyed out)
  if (status === 'completed' || completed_at) {
    return {
      status: 'completed',
      message: 'Completed',
      className: 'text-muted-foreground opacity-60',
    };
  }

  // All other tasks return blue styling
  return {
    status: 'normal',
    message: '',
    className: 'text-blue-700 dark:text-blue-300',
  };
}

/**
 * Formats due date with deadline status information
 */
export function formatDueDateWithStatus(due_date: string | null | undefined, status: string): string {
  if (!due_date) return '';
  
  const dueDate = new Date(due_date);
  if (!isValid(dueDate)) return '';
  
  const deadlineInfo = getDeadlineInfo(due_date, status);
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  
  return deadlineInfo.message ? `${formattedDate} (${deadlineInfo.message})` : formattedDate;
}