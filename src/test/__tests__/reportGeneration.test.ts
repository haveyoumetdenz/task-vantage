import { describe, it, expect } from 'vitest'
import {
  calculateCompletionRate,
  calculateAverageCompletionTime,
  generateTaskSummaryReport,
  generateTeamPerformanceReport,
  formatReportForPDF
} from '@/utils/reportGeneration'
import { Task } from '@/hooks/useFirebaseTasks'

describe('Report Generation - RGE-COR-02', () => {
  const createTestTask = (overrides: Partial<Task> = {}): Task => {
    const now = new Date()
    const created = overrides.createdAt ? new Date(overrides.createdAt) : new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    const completed = overrides.completedAt ? new Date(overrides.completedAt) : new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days later
    
    return {
      id: 'task-1',
      title: 'Test Task',
      status: 'todo',
      priority: 5,
      userId: 'user-1',
      createdAt: created.toISOString(),
      updatedAt: now.toISOString(),
      ...overrides,
      completedAt: overrides.status === 'completed' ? (overrides.completedAt || completed.toISOString()) : undefined
    }
  }

  describe('calculateCompletionRate', () => {
    it('should calculate correct completion rate', () => {
      expect(calculateCompletionRate(5, 10)).toBe(50)
      expect(calculateCompletionRate(10, 10)).toBe(100)
      expect(calculateCompletionRate(0, 10)).toBe(0)
    })

    it('should return 0 for zero total tasks', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0)
    })
  })

  describe('calculateAverageCompletionTime', () => {
    it('should calculate average completion time', () => {
      const now = new Date()
      const created1 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      const completed1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago (5 days to complete)
      
      const created2 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      const completed2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago (6 days to complete)
      
      const tasks: Task[] = [
        createTestTask({ 
          id: '1', 
          status: 'completed',
          createdAt: created1.toISOString(),
          completedAt: completed1.toISOString()
        }),
        createTestTask({ 
          id: '2', 
          status: 'completed',
          createdAt: created2.toISOString(),
          completedAt: completed2.toISOString()
        })
      ]
      
      const avgTime = calculateAverageCompletionTime(tasks)
      
      expect(avgTime).toBeDefined()
      expect(avgTime).toBeCloseTo(5.5, 1) // Average of 5 and 6 days
    })

    it('should return undefined for no completed tasks', () => {
      const tasks: Task[] = [
        createTestTask({ status: 'todo' }),
        createTestTask({ status: 'in_progress' })
      ]
      
      const avgTime = calculateAverageCompletionTime(tasks)
      
      expect(avgTime).toBeUndefined()
    })
  })

  describe('generateTaskSummaryReport', () => {
    it('should generate correct summary report', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'todo' }),
        createTestTask({ id: '2', status: 'in_progress' }),
        createTestTask({ id: '3', status: 'completed' }),
        createTestTask({ id: '4', status: 'todo', dueDate: pastDate.toISOString() })
      ]
      
      const report = generateTaskSummaryReport(tasks)
      
      expect(report.totalTasks).toBe(4)
      expect(report.completedTasks).toBe(1)
      expect(report.inProgressTasks).toBe(1)
      expect(report.overdueTasks).toBe(1)
      expect(report.completionRate).toBe(25) // 1/4 = 25%
    })
  })

  describe('generateTeamPerformanceReport', () => {
    it('should generate correct team performance report', () => {
      const tasks: Task[] = [
        createTestTask({ id: '1', status: 'completed', assigneeIds: ['user-1'] }),
        createTestTask({ id: '2', status: 'todo', assigneeIds: ['user-1'] }),
        createTestTask({ id: '3', status: 'completed', assigneeIds: ['user-2'] })
      ]
      
      const memberMap = new Map([
        ['user-1', { id: 'user-1', name: 'User 1' }],
        ['user-2', { id: 'user-2', name: 'User 2' }]
      ])
      
      const report = generateTeamPerformanceReport(tasks, 'team-1', 'Team 1', memberMap)
      
      expect(report.teamId).toBe('team-1')
      expect(report.teamName).toBe('Team 1')
      expect(report.totalTasks).toBe(3)
      expect(report.completedTasks).toBe(2)
      expect(report.completionRate).toBe(67) // 2/3 = 67%
      expect(report.memberContributions.length).toBe(2)
      
      // Check user-1 contributions
      const user1Contrib = report.memberContributions.find(m => m.userId === 'user-1')
      expect(user1Contrib).toBeDefined()
      expect(user1Contrib?.tasksAssigned).toBe(2)
      expect(user1Contrib?.tasksCompleted).toBe(1)
    })
  })

  describe('formatReportForPDF', () => {
    it('should format task summary report for PDF', () => {
      const report = {
        totalTasks: 10,
        completedTasks: 5,
        inProgressTasks: 2,
        overdueTasks: 1,
        completionRate: 50,
        averageCompletionTime: 5.5
      }
      
      const formatted = formatReportForPDF(report)
      
      expect(formatted).toContain('Task Summary Report')
      expect(formatted).toContain('Total Tasks: 10')
      expect(formatted).toContain('Completion Rate: 50%')
    })

    it('should format team performance report for PDF', () => {
      const report = {
        teamId: 'team-1',
        teamName: 'Team 1',
        totalTasks: 10,
        completedTasks: 5,
        inProgressTasks: 2,
        overdueTasks: 1,
        completionRate: 50,
        averageCompletionTime: 5.5,
        memberContributions: [
          {
            userId: 'user-1',
            userName: 'User 1',
            tasksAssigned: 5,
            tasksCompleted: 3,
            completionRate: 60
          }
        ]
      }
      
      const formatted = formatReportForPDF(report)
      
      expect(formatted).toContain('Team Performance Report')
      expect(formatted).toContain('Team 1')
      expect(formatted).toContain('User 1')
    })
  })
})

