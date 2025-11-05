# How to Run All Tests

## 📊 Test Overview

### ✅ Unit Tests: **18 test files, 362 tests**
- All validation logic tests
- No emulator needed
- Fast execution

### ✅ Integration Tests: **7 test files**
- Emulator-backed tests (write/read real Firestore data)
- **Requires Firestore Emulator running**

### ✅ E2E Tests: **4 test files**
- Browser-based tests (Playwright)
- **Requires Firestore Emulator + build**

---

## 🚀 Quick Start

### Step 1: Stop any running emulators
```bash
npm run emulator:stop
```

### Step 2: Start Firestore Emulator (Terminal 1)
```bash
npm run emulator:start
```

Wait for:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
```

**Keep this terminal running!**

### Step 3: Run Tests (Terminal 2)

```bash
# Unit tests (no emulator needed)
npm run test:run

# Integration tests (needs emulator)
npm run test:emu

# E2E tests (needs emulator + build)
npm run build
npm run test:e2e
```

---

## 📋 Detailed Test Commands

### Unit Tests (No Setup Required)

**Run all unit tests:**
```bash
npm run test:run
```

**Run with UI:**
```bash
npm run test:ui
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Watch mode (auto-rerun on changes):**
```bash
npm run test:watch
```

**Expected Result:**
```
Test Files  25 passed (25)
Tests  362 passed (362)
```

---

### Integration Tests (Needs Emulator)

**Prerequisites:**
1. Firestore Emulator must be running (Terminal 1)
2. Run this in Terminal 2

**Run integration tests:**
```bash
npm run test:emu
```

**Integration Test Files:**
- ✅ `tasks.integration.emulator.test.ts` - TM-COR-01 (Create Task)
- ✅ `task-status.integration.emulator.test.ts` - TM-COR-03 (Change Task Status)
- ✅ `recurrence.integration.emulator.test.ts` - TM-COR-05 (Task Recurrence)
- ✅ `projects.integration.emulator.test.ts` - TGO-COR-01 (Create Project)
- ✅ `subtasks.integration.emulator.test.ts` - TGO-COR-04 (Create Subtasks)
- ✅ `notifications.integration.emulator.test.ts` - NS-COR-01 (Notifications)
- ✅ `due-dates.integration.emulator.test.ts` - DST-COR-01 (Due Dates)

**Expected Result:**
```
Test Files  7 passed (7)
Tests  26 passed (26)
```

**Note:** If you see PERMISSION_DENIED errors, check:
1. Emulator is running: `npm run emulator:status`
2. Rules are loaded correctly (check `firestore.rules`)

---

### E2E Tests (Needs Emulator + Build)

**Prerequisites:**
1. Firestore Emulator must be running (Terminal 1)
2. Build the app first

**Run E2E tests:**
```bash
# Build the app
npm run build

# Run E2E tests
npm run test:e2e
```

**E2E Test Files:**
- ✅ `create-task.spec.ts` - TM-COR-01 (Create Task in browser)
- ✅ `update-task-status.spec.ts` - TM-COR-03 (Update Task Status)
- ✅ `recurring-task.spec.ts` - TM-COR-05 (Recurring Tasks)
- ✅ `project-management.spec.ts` - TGO-COR-01 (Project Management)

**E2E Test Options:**
```bash
# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

**Expected Result:**
```
4 passed (4)
```

---

## 🎯 Complete Workflow

### Terminal 1: Emulator
```bash
# Check status
npm run emulator:status

# Stop any existing emulators
npm run emulator:stop

# Start emulator
npm run emulator:start
```

### Terminal 2: Tests
```bash
# 1. Unit tests (no emulator needed)
npm run test:run

# 2. Integration tests (needs emulator)
npm run test:emu

# 3. E2E tests (needs emulator + build)
npm run build
npm run test:e2e
```

---

## 📊 Test Coverage Summary

### Unit Tests (362 tests)
- ✅ `authValidation.test.ts`
- ✅ `taskValidation.test.ts`
- ✅ `recurrenceValidation.test.ts`
- ✅ `projectValidation.test.ts`
- ✅ `statusTransitionValidation.test.ts`
- ✅ `commentValidation.test.ts`
- ✅ `subtaskValidation.test.ts`
- ✅ `dueDateValidation.test.ts`
- ✅ `notificationValidation.test.ts`
- ✅ `dashboardMetrics.test.ts`
- ✅ `teamTaskFiltering.test.ts`
- ✅ `taskAssignmentValidation.test.ts`
- ✅ `projectAssociationValidation.test.ts`
- ✅ `projectCollaborationValidation.test.ts`
- ✅ `calendarCalculations.test.ts`
- ✅ `reportGeneration.test.ts`
- ✅ `working-tests.test.ts`
- ✅ `basic.test.ts`

### Integration Tests (7 files, ~26 tests)
- ✅ `tasks.integration.emulator.test.ts` - TM-COR-01
- ✅ `task-status.integration.emulator.test.ts` - TM-COR-03
- ✅ `recurrence.integration.emulator.test.ts` - TM-COR-05
- ✅ `projects.integration.emulator.test.ts` - TGO-COR-01
- ✅ `subtasks.integration.emulator.test.ts` - TGO-COR-04
- ✅ `notifications.integration.emulator.test.ts` - NS-COR-01
- ✅ `due-dates.integration.emulator.test.ts` - DST-COR-01

### E2E Tests (4 files)
- ✅ `create-task.spec.ts` - TM-COR-01
- ✅ `update-task-status.spec.ts` - TM-COR-03
- ✅ `recurring-task.spec.ts` - TM-COR-05
- ✅ `project-management.spec.ts` - TGO-COR-01

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Stop emulator
npm run emulator:stop

# Check status
npm run emulator:status

# Start again
npm run emulator:start
```

### PERMISSION_DENIED Errors
1. Make sure emulator is running: `npm run emulator:status`
2. Check `firestore.rules` has permissive rules
3. Restart emulator: `npm run emulator:restart`

### Tests Timing Out
1. Make sure emulator is running
2. Check emulator status: `npm run emulator:status`
3. Restart emulator: `npm run emulator:restart`

### E2E Tests Failing
1. Make sure app is built: `npm run build`
2. Make sure emulator is running
3. Check Playwright is installed: `npx playwright install`

---

## 📝 Quick Reference

| Test Type | Command | Needs Emulator | Needs Build |
|-----------|---------|----------------|-------------|
| **Unit** | `npm run test:run` | ❌ No | ❌ No |
| **Integration** | `npm run test:emu` | ✅ Yes | ❌ No |
| **E2E** | `npm run test:e2e` | ✅ Yes | ✅ Yes |

---

## ✅ Verification Checklist

Before running tests:

- [ ] Emulator stopped: `npm run emulator:stop`
- [ ] Emulator started: `npm run emulator:start` (Terminal 1)
- [ ] Emulator status: `npm run emulator:status` shows "RUNNING"
- [ ] Ready to run tests (Terminal 2)

---

## 🎉 All Tests Are Created!

All tests from the plan are implemented:
- ✅ TM-COR-01: Create Task (Unit + Integration + E2E)
- ✅ TM-COR-03: Change Task Status (Unit + Integration + E2E)
- ✅ TM-COR-05: Task Recurrence (Unit + Integration + E2E)
- ✅ TGO-COR-01: Create Project (Unit + Integration + E2E)
- ✅ Plus many more validation and utility tests!

**Total: 362 unit tests + 26 integration tests + 4 E2E test suites**

