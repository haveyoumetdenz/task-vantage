# E2E Testing Guide

This directory contains end-to-end (E2E) tests using Playwright. For comprehensive testing documentation, see [TESTING.md](../../TESTING.md) in the root directory.

## Quick Start

### Prerequisites

1. Start Firebase Emulators:
   ```bash
   npm run emulator:start
   ```

2. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

**Note:** Playwright automatically builds the app and starts the preview server.

## Test Structure

```
e2e/
├── helpers/
│   └── auth.ts              # Authentication helpers
├── tests/                    # E2E test files
│   ├── create-task.spec.ts
│   ├── create-project-e2e-page.spec.ts
│   ├── update-task-status.spec.ts
│   └── ...
└── README.md                # This file
```

## Test Commands

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run with Visible Browser

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### View HTML Report

```bash
npm run test:e2e:report
```

## Current E2E Tests

### TM-COR-01: Create Task
- **File:** `tests/create-task.spec.ts`
- **Tests:** Task creation through UI
- **Coverage:** Task form validation, success messages

### TGO-COR-01: Create Project
- **File:** `tests/create-project-e2e-page.spec.ts`
- **Tests:** Project creation through E2E test page
- **Coverage:** Project form validation, success messages

### TM-COR-03: Change Task Status
- **File:** `tests/update-task-status.spec.ts`
- **Tests:** Task status updates through UI
- **Coverage:** Status dropdown, save functionality

### TM-COR-05: Task Recurrence
- **File:** `tests/recurring-task.spec.ts`
- **Tests:** Recurring task creation and calendar view
- **Coverage:** Recurrence options, calendar integration

### Project Management Workflow
- **File:** `tests/project-management.spec.ts`
- **Tests:** Complete project workflow (create → assign task → view)
- **Coverage:** Project creation, task assignment, project detail view

## Test Reports

### Console Output

E2E tests show results in terminal:
```
✓  14 passed (48.3s)
✘  0 failed
```

### HTML Report

View detailed HTML report:
```bash
npm run test:e2e:report
```

**Report Includes:**
- Test results (pass/fail)
- Screenshots on failure
- Video recordings
- Trace files for debugging

**Location:** `playwright-report/` directory

## Writing E2E Tests

### Basic Test Structure

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

### Best Practices

1. **Use `data-testid` attributes** for reliable selectors
2. **Wait for elements** before interaction
3. **Use `force: true`** for clicks if element is intercepted
4. **Handle async operations** properly
5. **Clear data** between tests when needed

## Troubleshooting

### Emulator Connection Issues

**Error:** Tests not connecting to emulator

**Solution:**
1. Ensure emulators are running: `npm run emulator:start`
2. Check both Firestore (8080) and Auth (9099) emulators are running
3. Verify environment variables in `playwright.config.ts`

### Element Not Found

**Error:** `Element not found` or `Timeout waiting for element`

**Solution:**
1. Increase wait timeouts
2. Use `waitForSelector` before interactions
3. Check if element has `data-testid` attribute
4. Use `force: true` for clicks if needed

### Test Timeouts

**Solution:** Increase test timeout:
```typescript
test.setTimeout(60000) // 60 seconds
```

## Additional Resources

- [Main Testing Guide](../../TESTING.md) - Comprehensive testing documentation
- [Playwright Documentation](https://playwright.dev/)
- [E2E Testing Best Practices](https://playwright.dev/docs/best-practices)
