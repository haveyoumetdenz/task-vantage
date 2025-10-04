import { differenceInHours, isPast, isValid } from 'date-fns';

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
  // If no due date, return normal status
  if (!due_date) {
    return {
      status: 'normal',
      message: '',
      className: '',
    };
  }

  const dueDate = new Date(due_date);
  
  // If invalid date, return normal status
  if (!isValid(dueDate)) {
    return {
      status: 'normal',
      message: '',
      className: '',
    };
  }

  const now = new Date();

  // If task is completed, show as completed (greyed out)
  if (status === 'completed' || completed_at) {
    return {
      status: 'completed',
      message: 'Completed',
      className: 'text-muted-foreground opacity-60',
    };
  }

  // Check if overdue (past due date and not completed)
  if (isPast(dueDate)) {
    return {
      status: 'overdue',
      message: 'Overdue',
      className: 'text-destructive',
      badge: {
        text: 'Overdue',
        variant: 'destructive',
      },
    };
  }

  // Check if due within 24 hours
  const hoursUntilDue = differenceInHours(dueDate, now);
  if (hoursUntilDue <= 24 && hoursUntilDue >= 0) {
    return {
      status: 'due_soon',
      message: 'Due soon',
      className: 'text-yellow-700 dark:text-yellow-300 font-medium',
      badge: {
        text: '⚠️ Due soon',
        variant: 'warning',
      },
    };
  }

  // Normal status
  return {
    status: 'normal',
    message: '',
    className: '',
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