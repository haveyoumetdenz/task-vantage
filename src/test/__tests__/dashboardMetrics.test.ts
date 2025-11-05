import { describe, it, expect } from 'vitest'
import {
  calculateTaskMetrics,
  calculateProjectMetrics,
  filterTasksByStatus,
  filterTasksByPriority,
  searchTasks
} from '@/utils/dashboardMetrics'
import { Task } from '@/hooks/useFirebaseTasks'
import { Project } from '@/hooks/useFirebaseProjects'

describe('Dashboard Metrics - TM-COR-02, TGO-COR-02', () => {
  const createTestTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Test Task',
    status: 'todo',
    priority: 5,
    ...overrides
  })

  const createTestProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'project-1',
    title: 'Test Project',
    status: 'active',
    progress: 0,
    ...overrides
  })

  describe('calculateTaskMetrics', () => {
    it('should calculate metrics for empty task list', () => {
      const metrics = calculateTaskMetrics([])
      
      expect(metrics.total).toBe(0)
      expect(metrics.completed).toBe(0)
      expect(metrics.inProgress).toBe(0)
      expect(metrics.todo).toBe(0)
      expect(metrics.overdue).toBe(0)
    })

    it('should calculate metrics for mixed statuses', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo' }),
        createTestTask({ id: '2', status: 'in_progress' }),
        createTestTask({ id: '3', status: 'completed' }),
        createTestTask({ id: '4', status: 'cancelled' })
      ]
      
      const metrics = calculateTaskMetrics(tasks)
      
      expect(metrics.total).toBe(4)
      expect(metrics.completed).toBe(1)
      expect(metrics.inProgress).toBe(1)
      expect(metrics.todo).toBe(1)
    })

    it('should calculate overdue tasks', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo', due_date: pastDate.toISOString() }),
        createTestTask({ id: '2', status: 'todo', due_date: undefined }),
        createTestTask({ id: '3', status: 'completed', due_date: pastDate.toISOString() }) // Completed, not overdue
      ]
      
      const metrics = calculateTaskMetrics(tasks)
      
      expect(metrics.overdue).toBe(1)
    })

    it('should not count cancelled tasks as overdue', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'cancelled', due_date: pastDate.toISOString() })
      ]
      
      const metrics = calculateTaskMetrics(tasks)
      
      expect(metrics.overdue).toBe(0)
    })
  })

  describe('calculateProjectMetrics', () => {
    it('should calculate metrics for empty project list', () => {
      const metrics = calculateProjectMetrics([])
      
      expect(metrics.total).toBe(0)
      expect(metrics.active).toBe(0)
      expect(metrics.completed).toBe(0)
      expect(metrics.dueThisWeek).toBe(0)
    })

    it('should calculate metrics for mixed statuses', () => {
      const projects: Project[] = [
        createTestProject({ id: '1', status: 'active' }),
        createTestProject({ id: '2', status: 'completed' }),
        createTestProject({ id: '3', status: 'cancelled' })
      ]
      
      const metrics = calculateProjectMetrics(projects)
      
      expect(metrics.total).toBe(3)
      expect(metrics.active).toBe(1)
      expect(metrics.completed).toBe(1)
    })

    it('should calculate projects due this week', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3) // 3 days from now
      
      const projects: Project[] = [
        createTestProject({ id: '1', status: 'active', due_date: futureDate.toISOString() }),
        createTestProject({ id: '2', status: 'active', due_date: undefined }),
        createTestProject({ id: '3', status: 'completed', due_date: futureDate.toISOString() }) // Completed, not due
      ]
      
      const metrics = calculateProjectMetrics(projects)
      
      expect(metrics.dueThisWeek).toBe(1)
    })
  })

  describe('filterTasksByStatus', () => {
    it('should return all tasks when status is "all"', () => {
      const tasks: Task[] = [
        createTestTask({ status: 'todo' }),
        createTestTask({ status: 'in_progress' }),
        createTestTask({ status: 'completed' })
      ]
      
      const filtered = filterTasksByStatus(tasks, 'all')
      expect(filtered.length).toBe(3)
    })

    it('should filter by specific status', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo' }),
        createTestTask({ id: '2', status: 'in_progress' }),
        createTestTask({ id: '3', status: 'todo' })
      ]
      
      const filtered = filterTasksByStatus(tasks, 'todo')
      expect(filtered.length).toBe(2)
      expect(filtered.every(t => t.status === 'todo')).toBe(true)
    })
  })

  describe('filterTasksByPriority', () => {
    it('should return all tasks when priority is "all"', () => {
      const tasks: Task[] = [
        createTestTask({ priority: 1 }),
        createTestTask({ priority: 5 }),
        createTestTask({ priority: 10 })
      ]
      
      const filtered = filterTasksByPriority(tasks, 'all')
      expect(filtered.length).toBe(3)
    })

    it('should filter by low priority (1-3)', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', priority: 1 }),
        createTestTask({ id: '2', priority: 3 }),
        createTestTask({ id: '3', priority: 5 })
      ]
      
      const filtered = filterTasksByPriority(tasks, 'low')
      expect(filtered.length).toBe(2)
      expect(filtered.every(t => [1, 2, 3].includes(t.priority || 5))).toBe(true)
    })

    it('should filter by urgent priority (9-10)', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', priority: 9 }),
        createTestTask({ id: '2', priority: 10 }),
        createTestTask({ id: '3', priority: 5 })
      ]
      
      const filtered = filterTasksByPriority(tasks, 'urgent')
      expect(filtered.length).toBe(2)
      expect(filtered.every(t => [9, 10].includes(t.priority || 5))).toBe(true)
    })
  })

  describe('searchTasks', () => {
    it('should return all tasks when query is empty', () => {
      const tasks: Task[] = [
        createTestTask({ title: 'Task 1' }),
        createTestTask({ title: 'Task 2' })
      ]
      
      const filtered = searchTasks(tasks, '')
      expect(filtered.length).toBe(2)
    })

    it('should search by title', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', title: 'Frontend Task' }),
        createTestTask({ id: '2', title: 'Backend Task' }),
        createTestTask({ id: '3', title: 'Database Task' })
      ]
      
      const filtered = searchTasks(tasks, 'Frontend')
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Frontend Task')
    })

    it('should search by description', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', title: 'Task 1', description: 'Frontend development' }),
        createTestTask({ id: '2', title: 'Task 2', description: 'Backend development' })
      ]
      
      const filtered = searchTasks(tasks, 'Frontend')
      expect(filtered.length).toBe(1)
    })

    it('should be case-insensitive', () => {
      const tasks: Task[] = [
        createTestTask({ title: 'Frontend Task' })
      ]
      
      const filtered = searchTasks(tasks, 'frontend')
      expect(filtered.length).toBe(1)
    })

    it('should return empty array when no matches', () => {
      const tasks: Task[] = [
        createTestTask({ title: 'Task 1' })
      ]
      
      const filtered = searchTasks(tasks, 'Nonexistent')
      expect(filtered.length).toBe(0)
    })
  })
})

