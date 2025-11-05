import { describe, it, expect } from 'vitest'
import {
  filterTasksByTeam,
  getTeamTasksWithOption,
  isTaskOverdue,
  filterOverdueTasks,
  getTeamTaskStats
} from '@/utils/teamTaskFiltering'
import { Task } from '@/hooks/useFirebaseTasks'

describe('Team Task Filtering - TM-COR-04', () => {
  const createTestTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task',
    status: 'todo',
    priority: 5,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })

  describe('filterTasksByTeam', () => {
    it('should separate my tasks from team tasks', () => {
      const userId = 'user-1'
      const teamMemberIds = ['user-2', 'user-3']
      
      const tasks: Task[] = [
        createTestTask({ id: '1', assigneeIds: ['user-1'] }), // My task
        createTestTask({ id: '2', assigneeIds: ['user-2'] }), // Team task
        createTestTask({ id: '3', assigneeIds: ['user-1', 'user-2'] }), // My task (I'm assigned)
        createTestTask({ id: '4', assigneeIds: ['user-3'] }) // Team task
      ]
      
      const result = filterTasksByTeam(tasks, userId, teamMemberIds)
      
      expect(result.myTasks.length).toBe(2) // Tasks 1 and 3
      expect(result.teamTasks.length).toBe(2) // Tasks 2 and 4
      expect(result.myTasks.map(t => t.id)).toEqual(['1', '3'])
      expect(result.teamTasks.map(t => t.id)).toEqual(['2', '4'])
    })

    it('should not include my tasks in team tasks', () => {
      const userId = 'user-1'
      const teamMemberIds = ['user-2']
      
      const tasks: Task[] = [
        createTestTask({ id: '1', assigneeIds: ['user-1', 'user-2'] }) // My task, but also team member
      ]
      
      const result = filterTasksByTeam(tasks, userId, teamMemberIds)
      
      expect(result.myTasks.length).toBe(1)
      expect(result.teamTasks.length).toBe(0) // Not included because I'm assigned
    })
  })

  describe('getTeamTasksWithOption', () => {
    it('should return only team tasks when includeMyTasks is false', () => {
      const teamTasks = [createTestTask({ id: '1' })]
      const myTasks = [createTestTask({ id: '2' })]
      
      const result = getTeamTasksWithOption(teamTasks, myTasks, false)
      
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('1')
    })

    it('should merge team tasks and my tasks when includeMyTasks is true', () => {
      const teamTasks = [createTestTask({ id: '1' })]
      const myTasks = [createTestTask({ id: '2' })]
      
      const result = getTeamTasksWithOption(teamTasks, myTasks, true)
      
      expect(result.length).toBe(2)
      expect(result.map(t => t.id)).toEqual(['1', '2'])
    })

    it('should avoid duplicates when merging', () => {
      const sharedTask = createTestTask({ id: '1' })
      const teamTasks = [sharedTask]
      const myTasks = [sharedTask]
      
      const result = getTeamTasksWithOption(teamTasks, myTasks, true)
      
      expect(result.length).toBe(1)
    })
  })

  describe('isTaskOverdue', () => {
    it('should return false for completed tasks', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const task = createTestTask({
        status: 'completed',
        dueDate: pastDate.toISOString()
      })
      
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return false for cancelled tasks', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const task = createTestTask({
        status: 'cancelled',
        dueDate: pastDate.toISOString()
      })
      
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return true for overdue tasks', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const task = createTestTask({
        status: 'todo',
        dueDate: pastDate.toISOString()
      })
      
      expect(isTaskOverdue(task)).toBe(true)
    })

    it('should return false for tasks without due dates', () => {
      const task = createTestTask({
        status: 'todo',
        dueDate: undefined
      })
      
      expect(isTaskOverdue(task)).toBe(false)
    })
  })

  describe('filterOverdueTasks', () => {
    it('should filter overdue tasks', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo', dueDate: pastDate.toISOString() }),
        createTestTask({ id: '2', status: 'todo', dueDate: futureDate.toISOString() }),
        createTestTask({ id: '3', status: 'completed', dueDate: pastDate.toISOString() })
      ]
      
      const overdue = filterOverdueTasks(tasks)
      
      expect(overdue.length).toBe(1)
      expect(overdue[0].id).toBe('1')
    })
  })

  describe('getTeamTaskStats', () => {
    it('should calculate correct statistics', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo' }),
        createTestTask({ id: '2', status: 'in_progress' }),
        createTestTask({ id: '3', status: 'completed' }),
        createTestTask({ id: '4', status: 'todo', dueDate: pastDate.toISOString() })
      ]
      
      const stats = getTeamTaskStats(tasks)
      
      expect(stats.total).toBe(4)
      expect(stats.completed).toBe(1)
      expect(stats.inProgress).toBe(1)
      expect(stats.todo).toBe(2)
      expect(stats.overdue).toBe(1)
    })
  })
})

