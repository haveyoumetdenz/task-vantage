# Comprehensive Testing Strategy - Task Vantage

**Last Updated:** January 2025  
**Total User Stories:** 30  
**Current Test Coverage:** 3/30 (10%)

---

## 📊 Executive Summary

This document outlines a comprehensive testing strategy for Task Vantage, covering all 30 user stories from the product backlog. The strategy includes unit tests, integration tests, component tests, and end-to-end (E2E) tests to ensure complete coverage and quality assurance.

### Current State
- ✅ **Unit Tests:** 137 tests covering validation logic (TM-COR-01, TM-COR-05, TGO-COR-01)
- ✅ **Integration Tests:** 3 emulator-backed test suites
- ❌ **Component Tests:** Not yet implemented
- ❌ **E2E Tests:** Not yet implemented

### Target State
- **Unit Tests:** 90%+ coverage on all utility functions
- **Integration Tests:** All CRUD operations for completed user stories
- **Component Tests:** All React components with user interactions
- **E2E Tests:** All critical user journeys

---

## 📋 Test Coverage Matrix

### User Authorization & Authentication (UAA)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| UAA-COR-01 | User Registration | High | Complete | ❌ | ❌ | ❌ | ❌ |
| UAA-COR-02 | User Sign Up | High | Complete | ❌ | ❌ | ❌ | ❌ |
| UAA-COR-03 | Password Recovery | High | Complete | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Email validation
- Password policy enforcement
- Activation link expiration
- Account creation/deactivation
- Password reset flow

---

### Task Management (TM)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| TM-COR-01 | Create Task | High | Complete | ✅ | ✅ | ❌ | ❌ |
| TM-COR-02 | Create Task Dashboard | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TM-COR-03 | Change Task Status | High | Complete | ❌ | ✅ | ❌ | ❌ |
| TM-COR-04 | Manager Team Task Dashboard | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TM-COR-05 | Task Recurrence Option | High | Complete | ✅ | ✅ | ❌ | ❌ |
| TM-COR-06 | Manager Task Creation/Update | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TM-COR-07 | Comment in Activity Log | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TM-BON-01 | Filtering Tasks | Low | Sprint 3 | ❌ | ❌ | ❌ | ❌ |
| TM-BON-02 | Searching tasks/projects | Low | Sprint 3 | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Task CRUD operations
- Status transitions
- Priority management (1-10)
- Recurrence logic
- Team assignment permissions
- Dashboard metrics
- Filtering and search

---

### Task Grouping & Organization (TGO)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| TGO-COR-01 | Create Project | High | Complete | ✅ | ✅ | ❌ | ❌ |
| TGO-COR-02 | Create Project Dashboard | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TGO-COR-03 | Move Tasks | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TGO-COR-04 | Create Subtasks | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TGO-COR-05 | Collaborate with coworkers | High | Complete | ❌ | ❌ | ❌ | ❌ |
| TGO-BON-01 | Kanban Board | Low | Sprint 3 | ❌ | ❌ | ❌ | ❌ |
| TGO-BON-02 | Create Main Dashboard | Low | Sprint 3 | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Project CRUD operations
- Progress calculation
- Task-to-project association
- Subtask creation and management
- Team collaboration
- Dashboard metrics

---

### Deadline & Schedule Tracking (DST)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| DST-COR-01 | Attach/update due dates | High | Complete | ❌ | ❌ | ❌ | ❌ |
| DST-COR-02 | Viewing team's task deadlines | Medium | Complete | ❌ | ❌ | ❌ | ❌ |
| DST-COR-03 | Viewing calendar view | High | Complete | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Due date validation
- Overdue detection
- Calendar view (Day/Week/Month)
- Team calendar filtering
- Deadline notifications

---

### Notifications System (NS)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| NS-COR-01 | Task/Project Update | High | Complete | ❌ | ❌ | ❌ | ❌ |
| NS-COR-02 | Deadline Updates | High | Complete | ❌ | ❌ | ❌ | ❌ |
| NS-COR-03 | Customise Notifications | Medium | Sprint 3 | ❌ | ❌ | ❌ | ❌ |
| NS-COR-04 | Tag Mention Notification | High | Incomplete | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Notification creation
- Real-time delivery (within 3 seconds)
- Notification preferences
- @mention parsing
- Notification dismissal

---

### Report Generation & Exporting (RGE)

| Story ID | Title | Priority | Status | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------|-------|----------|--------|------------|-------------------|----------------|-----------|
| RGE-COR-01 | Generate Task Summary Report | Medium | Sprint 3 | ❌ | ❌ | ❌ | ❌ |
| RGE-COR-02 | Team Performance Report | High | Complete | ❌ | ❌ | ❌ | ❌ |
| RGE-COR-03 | Organization-Wide Export | Low | Sprint 3 | ❌ | ❌ | ❌ | ❌ |

**Test Requirements:**
- Report data aggregation
- PDF generation
- Role-based access control
- File naming conventions
- Data accuracy

---

## 🗺️ Testing Roadmap

### Phase 1: Complete High-Priority Stories (Sprint 1-2) - **URGENT**

**Target:** All completed High-Priority stories have full test coverage

#### Week 1-2: Unit Tests Expansion
- [ ] UAA-COR-01, UAA-COR-02, UAA-COR-03: Authentication validation
- [ ] TM-COR-02: Dashboard metrics calculation
- [ ] TM-COR-03: Status transition validation
- [ ] TM-COR-04: Team task filtering logic
- [ ] TM-COR-06: Assignment permission validation
- [ ] TM-COR-07: Comment validation
- [ ] TGO-COR-02: Project dashboard metrics
- [ ] TGO-COR-03: Task-to-project association
- [ ] TGO-COR-04: Subtask validation
- [ ] TGO-COR-05: Collaboration permission validation
- [ ] DST-COR-01: Due date validation and overdue detection
- [ ] DST-COR-03: Calendar date calculations
- [ ] NS-COR-01, NS-COR-02: Notification creation logic
- [ ] RGE-COR-02: Report data aggregation

#### Week 3-4: Integration Tests
- [ ] All CRUD operations for completed stories
- [ ] Firestore Emulator tests for:
  - Task status updates
  - Project task associations
  - Subtask creation
  - Notification creation
  - Report data queries

#### Week 5-6: Component Tests
- [ ] Form components (CreateTaskDialog, CreateProjectDialog, etc.)
- [ ] Dashboard components
- [ ] Calendar components
- [ ] Notification components
- [ ] Report components

---

### Phase 2: E2E Tests for Critical User Journeys

#### Critical User Journeys to Test:
1. **User Registration & First Task Creation**
   - UAA-COR-01 → UAA-COR-02 → TM-COR-01
   
2. **Manager Creates Task & Assigns to Team**
   - TM-COR-06 → TM-COR-04 → NS-COR-01
   
3. **Project Creation with Task Management**
   - TGO-COR-01 → TGO-COR-03 → TGO-COR-04
   
4. **Recurring Task Creation & Calendar View**
   - TM-COR-05 → DST-COR-03
   
5. **Task Status Updates & Notifications**
   - TM-COR-03 → NS-COR-01 → NS-COR-02
   
6. **Report Generation**
   - RGE-COR-02 (Team Performance Report)

---

### Phase 3: Medium & Low Priority Stories (Sprint 3)

- [ ] DST-COR-02: Team calendar view
- [ ] NS-COR-03: Notification preferences
- [ ] TM-BON-01: Task filtering
- [ ] TM-BON-02: Search functionality
- [ ] TGO-BON-01: Kanban board
- [ ] TGO-BON-02: Main dashboard
- [ ] RGE-COR-01: Task summary report
- [ ] RGE-COR-03: Organization-wide report

---

## 🧪 Test Types & Implementation

### 1. Unit Tests (Pure Functions)

**Framework:** Vitest  
**Coverage Target:** 90%+ for `src/utils/**`

**Example Test Structure:**
```typescript
describe('Task Status Validation - TM-COR-03', () => {
  it('should validate status transitions', () => {
    expect(isValidStatusTransition('todo', 'in_progress')).toBe(true)
    expect(isValidStatusTransition('completed', 'todo')).toBe(false)
  })
  
  it('should update last updated timestamp', () => {
    const task = { ...taskData, updatedAt: null }
    const updated = updateTaskStatus(task, 'in_progress')
    expect(updated.updatedAt).toBeDefined()
  })
})
```

**User Stories Requiring Unit Tests:**
- All validation logic (authentication, tasks, projects, dates)
- Business logic (progress calculation, status transitions)
- Utility functions (date formatting, filtering, searching)

---

### 2. Integration Tests (Firestore Emulator)

**Framework:** Vitest + Firestore Emulator  
**Coverage Target:** All CRUD operations

**Example Test Structure:**
```typescript
describe('Task Status Update - TM-COR-03 (Firestore Emulator)', () => {
  beforeAll(async () => {
    await clearCollection('tasks')
  })
  
  it('updates task status and saves to Firestore', async () => {
    const taskId = await createTaskEmu({ title: 'Test Task', status: 'todo' })
    await updateTaskStatusEmu(taskId, 'in_progress')
    
    const task = await getTaskByIdEmu(taskId)
    expect(task.status).toBe('in_progress')
    expect(task.updatedAt).toBeDefined()
  })
  
  it('rejects invalid status transitions', async () => {
    const taskId = await createTaskEmu({ title: 'Test', status: 'completed' })
    await expect(updateTaskStatusEmu(taskId, 'todo'))
      .rejects.toThrow('Invalid status transition')
  })
})
```

**User Stories Requiring Integration Tests:**
- All CRUD operations (Tasks, Projects, Subtasks, Notifications)
- Data persistence and retrieval
- Real-time updates
- Complex queries (team filtering, calendar views)

---

### 3. Component Tests (React Components)

**Framework:** Vitest + React Testing Library  
**Coverage Target:** All interactive components

**Example Test Structure:**
```typescript
describe('CreateTaskDialog - TM-COR-01', () => {
  it('renders all required fields', () => {
    render(<CreateTaskDialog open={true} onOpenChange={vi.fn()} />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })
  
  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<CreateTaskDialog open={true} onOpenChange={vi.fn()} />)
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })
  
  it('creates task with valid data', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn()
    
    render(<CreateTaskDialog open={true} onOpenChange={vi.fn()} onCreateTask={onCreateTask} />)
    
    await user.type(screen.getByLabelText(/title/i), 'New Task')
    await user.selectOptions(screen.getByLabelText(/priority/i), '5')
    await user.click(screen.getByRole('button', { name: /create/i }))
    
    expect(onCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Task', priority: 5 })
    )
  })
})
```

**User Stories Requiring Component Tests:**
- All form components (Create/Edit dialogs)
- Dashboard components
- Calendar components
- Notification components
- Report components
- Filter and search components

---

### 4. End-to-End Tests (E2E)

**Framework:** Playwright (Recommended) or Cypress  
**Coverage Target:** Critical user journeys

**Example Test Structure:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration & Task Creation Journey', () => {
  test('UAA-COR-01 → UAA-COR-02 → TM-COR-01', async ({ page }) => {
    // Step 1: HR creates account
    await page.goto('/login')
    await page.fill('[name="email"]', 'hr@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to user management
    await page.click('text=User Management')
    
    // Create new user
    await page.click('button:has-text("Add User")')
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.selectOption('[name="role"]', 'staff')
    await page.click('button:has-text("Create")')
    
    // Verify invitation sent
    await expect(page.locator('text=Invitation sent')).toBeVisible()
    
    // Step 2: New user activates account
    // (In real test, use activation link from email)
    await page.goto('/activate?token=test-activation-token')
    await page.fill('[name="password"]', 'newpassword123')
    await page.fill('[name="confirmPassword"]', 'newpassword123')
    await page.click('button[type="submit"]')
    
    // Step 3: Create first task
    await page.click('text=Tasks')
    await page.click('button:has-text("Create Task")')
    await page.fill('[name="title"]', 'My First Task')
    await page.selectOption('[name="priority"]', '5')
    await page.click('button:has-text("Create")')
    
    // Verify task appears
    await expect(page.locator('text=My First Task')).toBeVisible()
  })
})
```

**Critical E2E Test Scenarios:**

1. **Registration & Onboarding**
   - UAA-COR-01: HR creates account
   - UAA-COR-02: User activates account
   - TM-COR-01: User creates first task

2. **Manager Workflow**
   - TM-COR-06: Manager creates task
   - TM-COR-06: Manager assigns to team member
   - TM-COR-04: Manager views team dashboard
   - NS-COR-01: Team member receives notification

3. **Project Management**
   - TGO-COR-01: Create project
   - TGO-COR-03: Add tasks to project
   - TGO-COR-04: Create subtasks
   - TGO-COR-05: Invite collaborators

4. **Recurring Tasks**
   - TM-COR-05: Create recurring task
   - DST-COR-03: View in calendar
   - Verify instances are created

5. **Notifications**
   - TM-COR-06: Task assignment triggers notification
   - NS-COR-01: Notification appears in panel
   - NS-COR-02: Overdue task triggers notification

6. **Reports**
   - RGE-COR-02: Manager generates team report
   - Verify PDF download
   - Verify data accuracy

---

## 🤖 Test Automation Strategy

### CI/CD Integration

**Current Setup:**
- ✅ Unit tests run in CI
- ✅ Integration tests run in CI (with Firestore Emulator)
- ❌ Component tests not yet in CI
- ❌ E2E tests not yet in CI

**Recommended Setup:**

```yaml
# .github/workflows/test.yml (Enhanced)
name: Comprehensive Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm install -g firebase-tools
      - run: firebase emulators:start --only firestore &
      - run: |
          timeout 60 bash -c 'until curl -s http://127.0.0.1:8080 > /dev/null 2>&1; do sleep 1; done'
      - run: npm run test:emu
      
  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:component
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run preview &
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

### Test Execution Strategy

**Local Development:**
```bash
# Unit tests (fast, watch mode)
npm test

# Integration tests (requires emulator)
firebase emulators:start --only firestore
npm run test:emu

# Component tests
npm run test:component

# E2E tests (requires app running)
npm run build
npm run preview
npm run test:e2e
```

**CI/CD Pipeline:**
- Run unit tests on every commit
- Run integration tests on pull requests
- Run component tests on pull requests
- Run E2E tests on main branch merges (or nightly)
- Generate coverage reports
- Upload test artifacts

**Test Data Management:**
- Use factories for consistent test data
- Clear collections before/after tests
- Use deterministic dates for time-dependent tests
- Mock external services (email, etc.)

---

## 📈 Coverage Goals

### Current Coverage
- **Unit Tests:** ~40% (validation utilities only)
- **Integration Tests:** ~10% (3 user stories)
- **Component Tests:** 0%
- **E2E Tests:** 0%

### Target Coverage (By End of Sprint 3)
- **Unit Tests:** 90%+ (all utility functions)
- **Integration Tests:** 100% (all completed CRUD operations)
- **Component Tests:** 80%+ (all interactive components)
- **E2E Tests:** 100% (all critical user journeys)

---

## 🎯 Priority Matrix

### High Priority (Must Have)
1. **Authentication & Authorization** (UAA-COR-01, 02, 03)
   - Security critical
   - Affects all other features
   
2. **Core Task Management** (TM-COR-01, 02, 03, 04, 06)
   - Primary functionality
   - High user impact
   
3. **Project Management** (TGO-COR-01, 02, 03, 04, 05)
   - Core feature
   - Business critical
   
4. **Calendar & Deadlines** (DST-COR-01, 03)
   - High user value
   - Time-sensitive

### Medium Priority (Should Have)
1. **Notifications** (NS-COR-01, 02, 04)
2. **Team Calendar** (DST-COR-02)
3. **Reports** (RGE-COR-02)

### Low Priority (Nice to Have)
1. **Filtering & Search** (TM-BON-01, 02)
2. **Kanban Board** (TGO-BON-01)
3. **Main Dashboard** (TGO-BON-02)
4. **Additional Reports** (RGE-COR-01, 03)

---

## 📝 Test Templates

### Unit Test Template
```typescript
import { describe, it, expect } from 'vitest'
import { functionToTest } from '@/utils/moduleName'

describe('ModuleName - User Story ID', () => {
  describe('Functionality Name', () => {
    it('should handle valid input', () => {
      const result = functionToTest(validInput)
      expect(result).toBe(expectedOutput)
    })
    
    it('should reject invalid input', () => {
      expect(() => functionToTest(invalidInput)).toThrow()
    })
    
    it('should handle edge cases', () => {
      // Test edge cases
    })
  })
})
```

### Integration Test Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { clearCollection } from '@/test/emulatorDb'
import { serviceFunction } from '@/services/serviceName'

describe('User Story ID - Feature Name (Firestore Emulator)', () => {
  beforeAll(async () => {
    await clearCollection('collectionName')
  })
  
  afterAll(async () => {
    await clearCollection('collectionName')
  })
  
  it('should create and retrieve data', async () => {
    const id = await serviceFunction(validData)
    const result = await getById(id)
    expect(result).toBeDefined()
    expect(result.field).toBe(expectedValue)
  })
  
  it('should reject invalid data', async () => {
    await expect(serviceFunction(invalidData)).rejects.toThrow()
  })
})
```

### Component Test Template
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ComponentName from '@/components/ComponentName'

describe('ComponentName - User Story ID', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText(/expected text/i)).toBeInTheDocument()
  })
  
  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)
    
    await user.click(screen.getByRole('button', { name: /action/i }))
    expect(screen.getByText(/result/i)).toBeInTheDocument()
  })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('User Story ID - Feature Name', () => {
  test('should complete user journey', async ({ page }) => {
    // Navigate
    await page.goto('/route')
    
    // Interact
    await page.fill('[name="field"]', 'value')
    await page.click('button:has-text("Submit")')
    
    // Verify
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

---

## 🚀 Next Steps

### Immediate Actions (Week 1)
1. ✅ Review this document with team
2. [ ] Set up Playwright for E2E tests
3. [ ] Create test templates for each test type
4. [ ] Expand unit tests for high-priority stories
5. [ ] Set up component test infrastructure

### Short Term (Weeks 2-4)
1. [ ] Complete integration tests for all completed stories
2. [ ] Write component tests for all forms
3. [ ] Implement first E2E test scenario
4. [ ] Update CI/CD pipeline

### Medium Term (Weeks 5-8)
1. [ ] Complete all E2E test scenarios
2. [ ] Achieve 90%+ unit test coverage
3. [ ] Add tests for medium-priority stories
4. [ ] Set up test reporting and analytics

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Test Coverage Best Practices](https://testingjavascript.com/)

---

## 📊 Test Coverage Dashboard

### Current Status
```
Total User Stories: 30
├── Unit Tests: 3/30 (10%)
├── Integration Tests: 3/30 (10%)
├── Component Tests: 0/30 (0%)
└── E2E Tests: 0/30 (0%)

Overall Coverage: 10%
```

### Target Status (End of Sprint 3)
```
Total User Stories: 30
├── Unit Tests: 27/30 (90%)
├── Integration Tests: 27/30 (90%)
├── Component Tests: 27/30 (90%)
└── E2E Tests: 10/30 (33%) - Critical journeys only

Overall Coverage: 75%+
```

---

**Document Owner:** Development Team  
**Review Frequency:** Weekly during Sprint 3  
**Last Review Date:** January 2025

