# Test Implementation Checklist

Quick reference for implementing tests for all 30 user stories.

---

## ✅ Completed Tests

- [x] TM-COR-01: Create Task (Unit + Integration)
- [x] TM-COR-05: Task Recurrence (Unit + Integration)
- [x] TGO-COR-01: Create Project (Unit + Integration)

---

## 📋 Pending Tests by Priority

### 🔴 High Priority (Complete Stories)

#### User Authorization & Authentication
- [ ] **UAA-COR-01**: User Registration
  - [ ] Unit: Email validation, role validation
  - [ ] Integration: Account creation in Firestore
  - [ ] Component: UserRegistrationForm
  - [ ] E2E: HR creates account → User receives email

- [ ] **UAA-COR-02**: User Sign Up
  - [ ] Unit: Password validation, activation link expiration
  - [ ] Integration: Account activation, password set
  - [ ] Component: SignUpForm, ActivationPage
  - [ ] E2E: User activates account → Sets password

- [ ] **UAA-COR-03**: Password Recovery
  - [ ] Unit: Reset link generation, expiration logic
  - [ ] Integration: Password reset flow
  - [ ] Component: ForgotPasswordForm, ResetPasswordForm
  - [ ] E2E: User requests reset → Receives email → Resets password

#### Task Management
- [ ] **TM-COR-02**: Create Task Dashboard
  - [ ] Unit: Dashboard metrics calculation
  - [ ] Integration: Dashboard data aggregation
  - [ ] Component: TaskDashboard component
  - [ ] E2E: User views dashboard → Sees task counts

- [ ] **TM-COR-03**: Change Task Status
  - [ ] Unit: Status transition validation
  - [ ] Integration: Status update in Firestore
  - [ ] Component: StatusSelector, TaskCard
  - [ ] E2E: User changes status → Updates everywhere

- [ ] **TM-COR-04**: Manager Team Task Dashboard
  - [ ] Unit: Team task filtering logic
  - [ ] Integration: Team task queries
  - [ ] Component: TeamTaskDashboard, TeamTaskList
  - [ ] E2E: Manager views team dashboard → Sees team tasks

- [ ] **TM-COR-06**: Manager Task Creation/Update
  - [ ] Unit: Assignment permission validation
  - [ ] Integration: Task assignment to team members
  - [ ] Component: TaskAssigneeSelect, CreateTaskDialog
  - [ ] E2E: Manager creates task → Assigns to team → Team member sees it

- [ ] **TM-COR-07**: Comment in Activity Log
  - [ ] Unit: Comment validation, @mention parsing
  - [ ] Integration: Comment CRUD operations
  - [ ] Component: ActivityLog, CommentForm
  - [ ] E2E: User adds comment → Appears in activity log

#### Task Grouping & Organization
- [ ] **TGO-COR-02**: Create Project Dashboard
  - [ ] Unit: Project metrics calculation
  - [ ] Integration: Project dashboard queries
  - [ ] Component: ProjectDashboard component
  - [ ] E2E: User views project dashboard → Sees project counts

- [ ] **TGO-COR-03**: Move Tasks
  - [ ] Unit: Task-to-project association validation
  - [ ] Integration: Task project assignment
  - [ ] Component: ProjectSelector, TaskCard
  - [ ] E2E: User moves task to project → Appears in project

- [ ] **TGO-COR-04**: Create Subtasks
  - [ ] Unit: Subtask validation
  - [ ] Integration: Subtask CRUD operations
  - [ ] Component: SubtaskList, SubtaskForm
  - [ ] E2E: User creates subtask → Appears under parent task

- [ ] **TGO-COR-05**: Collaborate with coworkers
  - [ ] Unit: Collaboration permission validation
  - [ ] Integration: Project member management
  - [ ] Component: ProjectMembers, InviteMemberDialog
  - [ ] E2E: Project owner invites member → Member joins project

#### Deadline & Schedule Tracking
- [ ] **DST-COR-01**: Attach/update due dates
  - [ ] Unit: Due date validation, overdue detection
  - [ ] Integration: Due date updates in Firestore
  - [ ] Component: DatePicker, TaskCard (due date display)
  - [ ] E2E: User adds due date → Shows "Due Soon" badge

- [ ] **DST-COR-03**: Viewing calendar view
  - [ ] Unit: Calendar date calculations (Day/Week/Month)
  - [ ] Integration: Calendar task queries
  - [ ] Component: CalendarView, TaskCalendar
  - [ ] E2E: User views calendar → Sees tasks by date

#### Notifications System
- [ ] **NS-COR-01**: Task/Project Update
  - [ ] Unit: Notification creation logic
  - [ ] Integration: Notification CRUD operations
  - [ ] Component: NotificationPanel, NotificationItem
  - [ ] E2E: Task assigned → Notification appears → User clicks → Navigates to task

- [ ] **NS-COR-02**: Deadline Updates
  - [ ] Unit: Overdue notification logic
  - [ ] Integration: Deadline notification creation
  - [ ] Component: NotificationPanel (overdue badge)
  - [ ] E2E: Task becomes overdue → Notification appears

- [ ] **NS-COR-04**: Tag Mention Notification
  - [ ] Unit: @mention parsing
  - [ ] Integration: Mention notification creation
  - [ ] Component: CommentForm (@mention autocomplete)
  - [ ] E2E: User @mentions teammate → Teammate receives notification

#### Report Generation
- [ ] **RGE-COR-02**: Team Performance Report
  - [ ] Unit: Report data aggregation
  - [ ] Integration: Report data queries
  - [ ] Component: TeamPerformanceReport, PDFExport
  - [ ] E2E: Manager generates report → Downloads PDF

---

### 🟡 Medium Priority

- [ ] **DST-COR-02**: Viewing team's task deadlines
  - [ ] Unit: Team calendar filtering
  - [ ] Integration: Team calendar queries
  - [ ] Component: TeamCalendar component
  - [ ] E2E: Manager views team calendar → Sees team deadlines

- [ ] **NS-COR-03**: Customise Notifications
  - [ ] Unit: Notification preference validation
  - [ ] Integration: Preference updates
  - [ ] Component: NotificationPreferences component
  - [ ] E2E: User changes preferences → Settings saved

- [ ] **RGE-COR-01**: Generate Task Summary Report
  - [ ] Unit: Task summary aggregation
  - [ ] Integration: Task summary queries
  - [ ] Component: TaskSummaryReport, PDFExport
  - [ ] E2E: User generates report → Downloads PDF

---

### 🟢 Low Priority (Sprint 3)

- [ ] **TM-BON-01**: Filtering Tasks
- [ ] **TM-BON-02**: Searching tasks/projects
- [ ] **TGO-BON-01**: Kanban Board
- [ ] **TGO-BON-02**: Create Main Dashboard
- [ ] **RGE-COR-03**: Organization-Wide Export

---

## 🛠️ Implementation Order

### Week 1: Unit Tests for High Priority
1. UAA-COR-01, UAA-COR-02, UAA-COR-03 (Authentication)
2. TM-COR-02, TM-COR-03 (Task Dashboard & Status)
3. DST-COR-01 (Due dates)
4. NS-COR-01, NS-COR-02 (Notifications)

### Week 2: Integration Tests for High Priority
1. All CRUD operations for completed stories
2. Firestore Emulator tests
3. Complex queries (team filtering, calendar)

### Week 3: Component Tests
1. All form components
2. Dashboard components
3. Calendar components
4. Notification components

### Week 4: E2E Tests
1. Critical user journeys
2. Playwright setup
3. CI/CD integration

---

## 📝 Test File Structure

```
src/test/
├── __tests__/
│   ├── unit/
│   │   ├── uaa-cor-01.test.ts
│   │   ├── uaa-cor-02.test.ts
│   │   ├── tm-cor-02.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── uaa-cor-01.integration.emulator.test.ts
│   │   ├── tm-cor-02.integration.emulator.test.ts
│   │   └── ...
│   └── components/
│       ├── CreateTaskDialog.test.tsx
│       ├── TaskDashboard.test.tsx
│       └── ...
├── e2e/
│   ├── user-registration.spec.ts
│   ├── manager-workflow.spec.ts
│   └── ...
└── factories/
    ├── taskFactory.ts
    ├── projectFactory.ts
    └── userFactory.ts
```

---

## ✅ Definition of Done for Each Test

- [ ] **Unit Test:**
  - [ ] Tests validation logic
  - [ ] Tests edge cases
  - [ ] Tests error handling
  - [ ] Coverage ≥ 80%

- [ ] **Integration Test:**
  - [ ] Tests Firestore operations
  - [ ] Tests data persistence
  - [ ] Tests real-time updates
  - [ ] Uses Firestore Emulator

- [ ] **Component Test:**
  - [ ] Tests rendering
  - [ ] Tests user interactions
  - [ ] Tests form validation
  - [ ] Uses React Testing Library

- [ ] **E2E Test:**
  - [ ] Tests complete user journey
  - [ ] Tests across multiple pages
  - [ ] Tests user interactions
  - [ ] Uses Playwright

---

## 🚀 Quick Start Commands

```bash
# Run all unit tests
npm run test:run

# Run integration tests (requires emulator)
npm run test:emu

# Run component tests
npm run test:component

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

---

**Last Updated:** January 2025  
**Status:** In Progress

