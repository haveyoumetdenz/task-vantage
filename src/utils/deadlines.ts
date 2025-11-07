import { differenceInDays, differenceInHours, isPast, isValid } from 'date-fns';

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

  // If no due date, return normal status
  if (!due_date) {
    return {
      status: 'normal',
      message: '',
      className: 'text-blue-700 dark:text-blue-300',
    };
  }

  const dueDate = new Date(due_date);
  if (!isValid(dueDate)) {
    return {
      status: 'normal',
      message: '',
      className: 'text-blue-700 dark:text-blue-300',
    };
  }

  const now = new Date();
  
  // Check if overdue (past due date)
  if (isPast(dueDate)) {
    const daysOverdue = differenceInDays(now, dueDate);
    return {
      status: 'overdue',
      message: daysOverdue === 0 ? 'Overdue today' : `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
      className: 'text-red-600',
      badge: {
        text: 'Overdue',
        variant: 'destructive',
      },
    };
  }

  // Check if due soon (within 24 hours)
  const hoursUntilDue = differenceInHours(dueDate, now);
  if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
    return {
      status: 'due_soon',
      message: hoursUntilDue <= 1 ? 'Due in less than an hour' : `Due in ${Math.floor(hoursUntilDue)} hour${Math.floor(hoursUntilDue) > 1 ? 's' : ''}`,
      className: 'text-yellow-600',
      badge: {
        text: 'Due Soon',
        variant: 'warning',
      },
    };
  }

  // Normal status (not overdue, not due soon)
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