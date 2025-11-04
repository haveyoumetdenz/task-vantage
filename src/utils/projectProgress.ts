import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'

/**
 * Updates the progress of a project based on its tasks
 * @param projectId - The ID of the project to update
 * @param tasks - Array of all tasks (will be filtered by projectId)
 */
export const updateProjectProgress = async (projectId: string, tasks: any[]) => {
  try {
    // Filter tasks for this specific project
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    
    if (projectTasks.length === 0) {
      console.log(`📊 No tasks found for project ${projectId}, setting progress to 0%`)
      await updateDoc(doc(db, 'projects', projectId), {
        progress: 0,
        updatedAt: new Date().toISOString()
      })
      return
    }

    // Calculate progress based on completed tasks
    const completedTasks = projectTasks.filter(task => task.status === 'completed')
    const progress = Math.round((completedTasks.length / projectTasks.length) * 100)
    
    console.log(`📊 Updating project ${projectId} progress: ${completedTasks.length}/${projectTasks.length} tasks completed (${progress}%)`)
    
    // Determine if project should be marked as completed
    const shouldBeCompleted = progress === 100 && projectTasks.length > 0
    
    // Update the project progress and status
    const updateData: any = {
      progress: progress,
      updatedAt: new Date().toISOString()
    }
    
    // If all tasks are completed, mark project as completed
    if (shouldBeCompleted) {
      updateData.status = 'completed'
      console.log(`🎉 Project ${projectId} is now completed! All tasks finished.`)
    }
    
    await updateDoc(doc(db, 'projects', projectId), updateData)
    
    console.log(`✅ Project ${projectId} progress updated to ${progress}%${shouldBeCompleted ? ' and marked as completed' : ''}`)
  } catch (error) {
    console.error('❌ Error updating project progress:', error)
    throw error
  }
}

/**
 * Updates project progress for all projects that have tasks
 * @param tasks - Array of all tasks
 */
export const updateAllProjectsProgress = async (tasks: any[]) => {
  try {
    // Get all unique project IDs from tasks
    const projectIds = [...new Set(tasks.map(task => task.projectId).filter(Boolean))]
    
    console.log(`📊 Updating progress for ${projectIds.length} projects`)
    
    // Update progress for each project
    await Promise.all(
      projectIds.map(projectId => updateProjectProgress(projectId, tasks))
    )
    
    console.log('✅ All project progress updated successfully')
  } catch (error) {
    console.error('❌ Error updating all projects progress:', error)
    throw error
  }
}
