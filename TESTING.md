# Testing Guide - Task Vantage

Comprehensive guide for running, understanding, and maintaining tests in the Task Vantage project.

## Overview

Task Vantage uses a comprehensive testing strategy with three types of tests:

- **Unit Tests**: Fast, isolated tests for validation logic and utility functions
- **Integration Tests**: Emulator-backed tests for database operations and business logic
- **E2E Tests**: Browser-based tests for complete user journeys

### Testing Philosophy

Our testing approach follows Python unittest style patterns:
- **Descriptive test names**: Clear, readable test descriptions
- **Helper methods**: Reusable test data factories
- **Setup methods**: Consistent test environment setup
- **Comprehensive coverage**: Happy path, validation, edge cases, and error handling

---

## Running Tests

### Prerequisites

Before running tests, ensure you have:
- Node.js (v18 or higher) installed
- npm dependencies installed: `npm install`
- Firebase CLI installed: `npm install -g firebase-tools`

### Unit Tests

**No emulator required** - Fast execution

```bash
# Run all unit tests once
npm run test:run

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

**Expected Output:**
```
Test Files  25 passed (25)
Tests  362 passed (362)
```

**What Gets Tested:**
- Validation logic (task, project, recurrence)
- Utility functions
- Data transformation
- Business logic calculations

**Test Location:**
- `src/test/__tests__/*.test.ts`

---

### Integration Tests

**Requires Firestore Emulator running**

#### Step 1: Start Firestore Emulator

In Terminal 1:
```bash
npm run emulator:start
```

Wait for:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
✔  auth: Emulator started at http://127.0.0.1:9099
```

**Keep this terminal running!**

#### Step 2: Run Integration Tests

In Terminal 2:
```bash
npm run test:emu
```

**Expected Output:**
```
Test Files  7 passed (7)
Tests  [integration test results]
```

**What Gets Tested:**
- Task creation (TM-COR-01)
- Task status updates (TM-COR-03)
- Project creation (TGO-COR-01)
- Task-project associations (TGO-COR-03)
- Recurring tasks (TM-COR-05)
- Due date management (DST-COR-01)

**Test Location:**
- `src/test/__tests__/*.integration.emulator.test.ts`

**Emulator Management:**
- Stop emulator: `npm run emulator:stop`
- Check status: `npm run emulator:status`
- Restart: `npm run emulator:restart`

---

### E2E Tests

**Requires Firestore Emulator + Auth Emulator + Build**

#### Step 1: Start Emulators

In Terminal 1:
```bash
npm run emulator:start
```

Wait for both emulators to start:
```
✔  firestore: Emulator started at http://127.0.0.1:8080
✔  auth: Emulator started at http://127.0.0.1:9099
```

**Keep this terminal running!**

#### Step 2: Run E2E Tests

In Terminal 2:
```bash
npm run test:e2e
```

**Note:** Playwright automatically:
1. Builds the app with emulator environment variables
2. Starts the preview server
3. Opens a browser (headless)
4. Runs all E2E tests
5. Generates reports

**Expected Output:**
```
Running 14 tests using 4 workers

✓  [chromium] › e2e/tests/create-task.spec.ts
✓  [chromium] › e2e/tests/create-project-e2e-page.spec.ts
...

14 passed
```

**What Gets Tested:**
- Complete user workflows
- UI interactions (clicks, forms, navigation)
- Task creation through UI
- Project creation through UI
- Status updates
- Recurring task creation
- Project management workflows

**Test Location:**
- `e2e/tests/*.spec.ts`

**E2E Test Commands:**
- `npm run test:e2e` - Run all E2E tests (headless)
- `npm run test:e2e:headed` - Run with visible browser
- `npm run test:e2e:debug` - Debug mode with Playwright UI
- `npm run test:e2e:report` - View HTML report

---

## Test Reports

### Unit & Integration Test Reports

#### Console Output

All tests show results in the terminal:
```
✓ src/test/__tests__/taskValidation.test.ts (5)
  ✓ Task Validation - should validate task with all required fields
  ✓ Task Validation - should reject task without title
  ...

Test Files  25 passed (25)
Tests  362 passed (362)
Duration  2.34s
```

#### Coverage Report

Generate HTML coverage report:
```bash
npm run test:coverage
```

**View Report:**
1. Open `coverage/index.html` in your browser
2. See coverage by file, function, line, and branch
3. Identify untested code

**Coverage Thresholds:**
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**Coverage Location:**
- `coverage/` directory

---

### E2E Test Reports

#### Console Output

E2E tests show results in terminal:
```
✓  1 [chromium] › e2e/tests/create-task.spec.ts:33:3 › TM-COR-01: Create Task › should create a task through the UI (4.5s)
✓  2 [chromium] › e2e/tests/create-project-e2e-page.spec.ts:31:3 › TGO-COR-01: Create Project (E2E Test Page) › should create a project through E2E test page (3.9s)
...

14 passed (48.3s)
```

#### HTML Report

View detailed HTML report:
```bash
npm run test:e2e:report
```

**Report Includes:**
- Test results (pass/fail)
- Screenshots on failure
- Video recordings of test execution
- Trace files for debugging
- Test execution timeline

**Report Location:**
- `playwright-report/` directory

#### Artifacts

On test failure, Playwright saves:
- **Screenshots**: `test-results/*/test-failed-1.png`
- **Videos**: `test-results/*/video.webm`
- **Traces**: For debugging failed tests

---

## CI/CD Integration

### GitHub Actions Workflow

The project includes a CI/CD pipeline at `.github/workflows/test.yml` that automatically runs:

**On Push/Pull Request to `main` branch:**
1. ✅ Unit tests
2. ✅ Integration tests (with Firestore Emulator)
3. ✅ Coverage report generation
4. ✅ Coverage artifacts upload

**Current Workflow:**
```yaml
jobs:
  test:
    - Run unit tests
    - Start Firestore Emulator
    - Run integration tests
    - Generate coverage report
    - Upload coverage artifacts
```

### Viewing CI/CD Results

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Click on the latest workflow run
4. View test results for each job
5. Download coverage artifacts if needed

### E2E Tests in CI/CD

E2E tests are not yet included in CI/CD but can be added. They require:
- Additional setup time (browser installation)
- Longer execution time
- More complex emulator configuration

**To add E2E tests to CI/CD:**
1. Install Playwright browsers in CI
2. Start both Firestore and Auth emulators
3. Build the app with emulator environment variables
4. Run E2E tests
5. Upload Playwright reports as artifacts

---

## Test Structure

### Directory Organization

```
task-vantage-main/
├── src/test/
│   ├── setup.ts                    # Global test setup and mocks
│   ├── emulatorDb.ts              # Emulator connection utilities
│   ├── factories/                 # Test data factories
│   │   ├── taskFactory.ts
│   │   ├── projectFactory.ts
│   │   └── userFactory.ts
│   ├── utils/                      # Test utilities
│   │   └── test-utils.tsx
│   └── __tests__/                  # Test files
│       ├── *.test.ts              # Unit tests
│       └── *.integration.emulator.test.ts  # Integration tests
├── e2e/
│   ├── helpers/                   # E2E test helpers
│   │   └── auth.ts               # Authentication helpers
│   └── tests/                     # E2E test files
│       └── *.spec.ts
└── coverage/                      # Coverage reports
```

### Test Naming Convention

Follow descriptive naming patterns:

**Unit Tests:**
```typescript
describe('Task Validation', () => {
  it('should validate task with all required fields', () => {})
  it('should reject task without title', () => {})
  it('should reject task with invalid priority', () => {})
})
```

**Integration Tests:**
```typescript
describe('TM-COR-01: Create Task', () => {
  it('should create task with all required fields', () => {})
  it('should create task with optional fields', () => {})
})
```

**E2E Tests:**
```typescript
test('TM-COR-01: Create Task › should create a task through the UI', () => {})
```

### Writing New Tests

#### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { validateTaskData } from '@/utils/taskValidation'

describe('Task Validation', () => {
  it('should validate task with all required fields', () => {
    const taskData = {
      title: 'Test Task',
      status: 'todo',
      priority: 5,
      userId: 'user123'
    }
    
    const result = validateTaskData(taskData)
    expect(result.isValid).toBe(true)
  })
})
```

#### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { createTaskEmu } from '@/services/tasks.emu'
import { clearCollection } from '@/test/emulatorDb'

describe('TM-COR-01: Create Task', () => {
  beforeAll(async () => {
    // Verify emulator is running
    await checkEmulatorConnection()
  })

  beforeEach(async () => {
    // Clear tasks before each test
    await clearCollection('tasks')
  })

  it('should create task with all required fields', async () => {
    const taskData = {
      title: 'Test Task',
      status: 'todo',
      priority: 5,
      assigneeIds: []
    }
    
    const taskId = await createTaskEmu(taskData)
    expect(taskId).toBeTruthy()
  })
})
```

#### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'
import { ensureTestUser, TEST_USERS } from '../helpers/auth'

test.describe('TM-COR-01: Create Task', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test user exists
    const user = TEST_USERS.real
    await ensureTestUser(user.email, user.password, user.fullName, user.role)
    
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|tasks|$)/, { timeout: 15000 })
  })

  test('should create a task through the UI', async ({ page }) => {
    await page.goto('/tasks')
    await page.click('button:has-text("Create Task")')
    await page.fill('[name="title"]', 'E2E Test Task')
    await page.click('button:has-text("Create")')
    await expect(page.locator('text=E2E Test Task')).toBeVisible()
  })
})
```

---

## Test Results Summary

After running tests, you'll see summary reports:

### Unit Tests Summary

```
Test Files  25 passed (25)
Tests  362 passed (362)
Duration  2.34s
```

### Integration Tests Summary

```
Test Files  7 passed (7)
Tests  [number] passed
Duration  [time]
```

### E2E Tests Summary

```
Running 14 tests using 4 workers

✓  14 passed (48.3s)
✘  0 failed
```

---

## Troubleshooting

### Emulator Connection Issues

**Error:** `ECONNREFUSED 127.0.0.1:8080`

**Solution:**
1. Check if emulator is running: `npm run emulator:status`
2. Start emulator: `npm run emulator:start`
3. Wait for confirmation: `✔  firestore: Emulator started at http://127.0.0.1:8080`

**Error:** `PERMISSION_DENIED` in integration tests

**Solution:**
1. Ensure `firestore.rules` file exists
2. Check `firebase.json` has correct rules path
3. Restart emulator with explicit rules: `firebase emulators:start --only firestore --project task-vantage-test`

### Test Timeouts

**Error:** `Test timeout of 30000ms exceeded`

**Solution:**
1. Increase timeout in test: `test.setTimeout(60000)`
2. Check emulator performance
3. Add explicit waits for async operations

### E2E Test Failures

**Error:** `Element not found` or `Timeout waiting for element`

**Solution:**
1. Increase wait timeouts
2. Use `waitForSelector` before interactions
3. Check if element has `data-testid` attribute
4. Use `force: true` for clicks if element is intercepted

**Error:** `Auth Emulator not available`

**Solution:**
1. Ensure Auth Emulator is running: `npm run emulator:start` (includes auth)
2. Check `firebase.json` has auth emulator configured
3. Verify port 9099 is available

### Coverage Issues

**Error:** `Coverage threshold not met`

**Solution:**
1. Review coverage report: `coverage/index.html`
2. Identify untested code
3. Add tests for uncovered lines
4. Adjust thresholds if needed (in `vitest.config.ts`)

---

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to clear data
- Don't rely on test execution order

### 2. Test Data

- Use factories for test data creation
- Don't use production data
- Clean up after tests

### 3. Test Naming

- Use descriptive names
- Include user story ID when applicable
- Describe what is being tested

### 4. Assertions

- One assertion per test when possible
- Use descriptive error messages
- Test both happy path and error cases

### 5. E2E Tests

- Use `data-testid` for reliable selectors
- Wait for elements before interaction
- Use `force: true` for clicks if needed
- Handle async operations properly

---

## Test Coverage

### Current Coverage

- **Unit Tests**: 362 tests covering validation logic
- **Integration Tests**: 7 test suites covering CRUD operations
- **E2E Tests**: 14 tests covering critical user journeys

### Coverage Goals

- **Unit Tests**: 90%+ coverage on utilities
- **Integration Tests**: All completed user stories
- **E2E Tests**: All critical workflows

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

**Last Updated:** January 2025

