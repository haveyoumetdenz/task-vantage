import { updateAllProjectsProgress } from './projectProgress'
import { useFirebaseTasks } from '@/hooks/useFirebaseTasks'

/**
 * Manually trigger project progress updates for all projects
 * This can be called when the UI detects inconsistencies
 */
export const triggerManualProjectUpdate = async () => {
  try {
    console.log('🔄 Manually triggering project progress update...')
    
    // Get all tasks from the current session
    // Note: This is a simplified approach - in a real app, you'd want to pass tasks as a parameter
    const { tasks } = useFirebaseTasks()
    
    if (tasks && tasks.length > 0) {
      await updateAllProjectsProgress(tasks)
      console.log('✅ Manual project progress update completed')
    } else {
      console.log('⚠️ No tasks found for manual update')
    }
  } catch (error) {
    console.error('❌ Error in manual project update:', error)
  }
}

/**
 * Check if a project needs progress update based on task completion
 * @param projectId - The project ID to check
 * @param tasks - Array of all tasks
 * @returns boolean indicating if update is needed
 */
export const needsProgressUpdate = (projectId: string, tasks: any[]): boolean => {
  const projectTasks = tasks.filter(task => task.projectId === projectId)
  const completedTasks = projectTasks.filter(task => task.status === 'completed')
  const realTimeProgress = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0
  
  // If real-time progress is 100% but project status is still active, it needs update
  return realTimeProgress === 100 && projectTasks.length > 0
}







