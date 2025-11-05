import { describe, it, expect, beforeAll } from 'vitest'
import { db, clearCollection } from '@/test/emulatorDb'
import { createTaskEmu, getTaskByIdEmu, updateTaskProjectEmu } from '@/services/tasks.emu'
import { createProjectEmu, getProjectByIdEmu, updateProjectProgressEmu } from '@/services/projects.emu'
import { checkEmulatorRunning, getEmulatorNotRunningMessage } from './emulator-check.helper'
import { validateTaskProjectAssociation } from '@/utils/projectAssociationValidation'

async function clearAll() {
  await clearCollection('tasks')
  await clearCollection('projects')
}

describe('TGO-COR-03: Move Tasks (Firestore Emulator)', () => {
  beforeAll(async () => {
    // Check if emulator is running
    const isRunning = await checkEmulatorRunning()
    if (!isRunning) {
      console.error(getEmulatorNotRunningMessage())
      throw new Error('Firestore Emulator is not running. Please start it with: npm run emulator:start')
    }
    await clearAll()
  })

  it('should move a task to a project', async () => {
    // Create a task without a project
    const taskId = await createTaskEmu({ 
      title: 'Task to Move', 
      status: 'todo', 
      priority: 5 
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task has no project initially - wait longer for emulator consistency
    let task = await getTaskByIdEmu(taskId)
    let retries = 0
    const maxRetries = 30 // Increased retries
    while (!task.exists && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 150)) // Longer wait
      task = await getTaskByIdEmu(taskId)
      retries++
    }

    if (!task.exists) {
      throw new Error(`Task ${taskId} was not found after ${maxRetries} retries`)
    }

    expect(task.exists).toBe(true)
    expect(task.data?.projectId).toBeUndefined()

    // Create a project
    const projectId = await createProjectEmu({ 
      title: 'Target Project',
      teamMembers: ['user-1']
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Validate user can move task (user-1 is a project member)
    const validation = validateTaskProjectAssociation({
      taskId,
      projectId,
      userId: 'user-1',
      projectMembers: ['user-1'],
      projectOwnerId: 'user-1'
    })
    expect(validation.valid).toBe(true)

    // Move task to project
    await updateTaskProjectEmu(taskId, projectId)

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task is now associated with project
    let updatedTask: any
    retries = 0
    while (retries < 10) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.projectId === projectId) break
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.projectId).toBe(projectId)
    expect(updatedTask.data?.updatedAt).toBeDefined()
  })

  it('should move a task from one project to another', async () => {
    // Create two projects
    const project1Id = await createProjectEmu({ 
      title: 'Source Project',
      teamMembers: ['user-1']
    })
    
    await new Promise(resolve => setTimeout(resolve, 200))

    const project2Id = await createProjectEmu({ 
      title: 'Destination Project',
      teamMembers: ['user-1']
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a task in project 1
    const taskId = await createTaskEmu({ 
      title: 'Task to Move Between Projects', 
      status: 'todo', 
      priority: 5,
      projectId: project1Id
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task is in project 1
    let task = await getTaskByIdEmu(taskId)
    let retries = 0
    while (!task.exists && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      task = await getTaskByIdEmu(taskId)
      retries++
    }

    expect(task.exists).toBe(true)
    expect(task.data?.projectId).toBe(project1Id)

    // Move task to project 2
    await updateTaskProjectEmu(taskId, project2Id)

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task is now in project 2
    let updatedTask: any
    retries = 0
    while (retries < 10) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && updatedTask.data?.projectId === project2Id) break
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.projectId).toBe(project2Id)
    expect(updatedTask.data?.projectId).not.toBe(project1Id)
  })

  it('should remove a task from a project', async () => {
    // Create a project
    const projectId = await createProjectEmu({ 
      title: 'Project to Remove From',
      teamMembers: ['user-1']
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a task in the project
    const taskId = await createTaskEmu({ 
      title: 'Task to Remove from Project', 
      status: 'todo', 
      priority: 5,
      projectId
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task is in project
    let task = await getTaskByIdEmu(taskId)
    let retries = 0
    while (!task.exists && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      task = await getTaskByIdEmu(taskId)
      retries++
    }

    expect(task.exists).toBe(true)
    expect(task.data?.projectId).toBe(projectId)

    // Remove task from project (set projectId to null)
    await updateTaskProjectEmu(taskId, null)

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task no longer has a project
    let updatedTask: any
    retries = 0
    while (retries < 10) {
      updatedTask = await getTaskByIdEmu(taskId)
      if (updatedTask.exists && (updatedTask.data?.projectId === null || updatedTask.data?.projectId === undefined)) break
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    expect(updatedTask.exists).toBe(true)
    expect(updatedTask.data?.projectId).toBeFalsy()
  })

  it('should update project progress when task is moved', async () => {
    // Create a project
    const projectId = await createProjectEmu({ 
      title: 'Project for Progress Test',
      teamMembers: ['user-1']
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Create a task without project
    const taskId = await createTaskEmu({ 
      title: 'Task for Progress Test', 
      status: 'completed', 
      priority: 5
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // Move task to project
    await updateTaskProjectEmu(taskId, projectId)

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify task is in project
    let task = await getTaskByIdEmu(taskId)
    let retries = 0
    while (!task.exists && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      task = await getTaskByIdEmu(taskId)
      retries++
    }

    expect(task.exists).toBe(true)
    expect(task.data?.projectId).toBe(projectId)

    // Update project progress (should include the completed task)
    await updateProjectProgressEmu(projectId, [{
      id: taskId,
      status: 'completed',
      priority: 5,
      createdAt: task.data?.createdAt || new Date().toISOString(),
      updatedAt: task.data?.updatedAt || new Date().toISOString()
    }])

    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify project progress was updated
    const project = await getProjectByIdEmu(projectId)
    expect(project.exists).toBe(true)
    expect(project.data?.progress).toBe(100) // 1 completed task = 100%
  })
})

