# E2E Testing Setup Guide - Playwright

This guide will help you set up Playwright for end-to-end testing of Task Vantage.

---

## 🚀 Quick Start

### Step 1: Install Playwright

```bash
npm install -D @playwright/test
npx playwright install --with-deps
```

### Step 2: Verify Installation

```bash
npx playwright --version
```

---

## 📁 Project Structure

```
task-vantage-main/
├── e2e/
│   ├── tests/
│   │   ├── user-registration.spec.ts
│   │   ├── manager-workflow.spec.ts
│   │   ├── project-management.spec.ts
│   │   └── ...
│   ├── fixtures/
│   │   ├── auth.ts
│   │   └── test-data.ts
│   └── page-objects/
│       ├── LoginPage.ts
│       ├── TasksPage.ts
│       ├── ProjectsPage.ts
│       └── ...
├── playwright.config.ts
└── package.json
```

---

## ⚙️ Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:4173', // Preview server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 📝 Example Test Files

### User Registration Journey (UAA-COR-01 → UAA-COR-02 → TM-COR-01)

**File:** `e2e/tests/user-registration.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration & First Task Creation', () => {
  test('UAA-COR-01 → UAA-COR-02 → TM-COR-01', async ({ page }) => {
    // Step 1: HR creates account (UAA-COR-01)
    await page.goto('/login')
    
    // Login as HR
    await page.fill('[name="email"]', 'hr@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to User Management
    await page.click('text=User Management')
    
    // Create new user
    await page.click('button:has-text("Add User")')
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.selectOption('[name="role"]', 'staff')
    await page.click('button:has-text("Create")')
    
    // Verify invitation sent
    await expect(page.locator('text=Invitation sent')).toBeVisible()
    
    // Step 2: New user activates account (UAA-COR-02)
    // In real scenario, use activation link from email
    await page.goto('/activate?token=test-activation-token')
    await page.fill('[name="password"]', 'newpassword123')
    await page.fill('[name="confirmPassword"]', 'newpassword123')
    await page.click('button[type="submit"]')
    
    // Verify activation success
    await expect(page.locator('text=Account activated')).toBeVisible()
    
    // Step 3: Create first task (TM-COR-01)
    await page.click('text=Tasks')
    await page.click('button:has-text("Create Task")')
    await page.fill('[name="title"]', 'My First Task')
    await page.selectOption('[name="priority"]', '5')
    await page.selectOption('[name="status"]', 'todo')
    await page.click('button:has-text("Create")')
    
    // Verify task appears
    await expect(page.locator('text=My First Task')).toBeVisible()
    await expect(page.locator('text=Priority 5')).toBeVisible()
  })
})
```

### Manager Workflow (TM-COR-06 → TM-COR-04 → NS-COR-01)

**File:** `e2e/tests/manager-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Manager Creates Task & Assigns to Team', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/login')
    await page.fill('[name="email"]', 'manager@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('TM-COR-06 → TM-COR-04 → NS-COR-01', async ({ page }) => {
    // Step 1: Manager creates task (TM-COR-06)
    await page.click('text=Tasks')
    await page.click('button:has-text("Create Task")')
    await page.fill('[name="title"]', 'Team Task')
    await page.selectOption('[name="priority"]', '7')
    
    // Assign to team member
    await page.click('[name="assignees"]')
    await page.click('text=team-member@example.com')
    
    await page.click('button:has-text("Create")')
    
    // Verify task created
    await expect(page.locator('text=Team Task')).toBeVisible()
    
    // Step 2: Manager views team dashboard (TM-COR-04)
    await page.click('text=Team Tasks')
    
    // Verify team task appears
    await expect(page.locator('text=Team Task')).toBeVisible()
    
    // Verify metrics update
    await expect(page.locator('text=Total Tasks')).toBeVisible()
    
    // Step 3: Team member receives notification (NS-COR-01)
    // Switch to team member account
    await page.click('button:has-text("Sign Out")')
    
    await page.goto('/login')
    await page.fill('[name="email"]', 'team-member@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Check notifications
    await page.click('button[aria-label="Notifications"]')
    
    // Verify notification appears
    await expect(page.locator('text=You were assigned to Team Task')).toBeVisible()
    
    // Click notification
    await page.click('text=You were assigned to Team Task')
    
    // Verify navigates to task
    await expect(page.locator('text=Team Task')).toBeVisible()
  })
})
```

### Project Management (TGO-COR-01 → TGO-COR-03 → TGO-COR-04)

**File:** `e2e/tests/project-management.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Project Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'staff@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('TGO-COR-01 → TGO-COR-03 → TGO-COR-04', async ({ page }) => {
    // Step 1: Create project (TGO-COR-01)
    await page.click('text=Projects')
    await page.click('button:has-text("Create Project")')
    await page.fill('[name="title"]', 'Test Project')
    await page.fill('[name="description"]', 'Project description')
    await page.selectOption('[name="status"]', 'active')
    await page.click('button:has-text("Create")')
    
    // Verify project created
    await expect(page.locator('text=Test Project')).toBeVisible()
    
    // Step 2: Move task to project (TGO-COR-03)
    await page.click('text=Tasks')
    
    // Create a task first
    await page.click('button:has-text("Create Task")')
    await page.fill('[name="title"]', 'Project Task')
    await page.click('button:has-text("Create")')
    
    // Move task to project
    await page.click('text=Project Task')
    await page.click('button:has-text("Edit")')
    await page.selectOption('[name="project"]', 'Test Project')
    await page.click('button:has-text("Save")')
    
    // Verify task in project
    await page.click('text=Projects')
    await page.click('text=Test Project')
    await expect(page.locator('text=Project Task')).toBeVisible()
    
    // Step 3: Create subtask (TGO-COR-04)
    await page.click('text=Project Task')
    await page.click('button:has-text("Add Subtask")')
    await page.fill('[name="subtaskTitle"]', 'Subtask 1')
    await page.click('button:has-text("Create")')
    
    // Verify subtask appears
    await expect(page.locator('text=Subtask 1')).toBeVisible()
  })
})
```

---

## 🎭 Page Object Model

### LoginPage.ts

```typescript
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('[name="email"]')
    this.passwordInput = page.locator('[name="password"]')
    this.submitButton = page.locator('button[type="submit"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

### TasksPage.ts

```typescript
import { Page, Locator } from '@playwright/test'

export class TasksPage {
  readonly page: Page
  readonly createTaskButton: Locator
  readonly taskList: Locator

  constructor(page: Page) {
    this.page = page
    this.createTaskButton = page.locator('button:has-text("Create Task")')
    this.taskList = page.locator('[data-testid="task-list"]')
  }

  async goto() {
    await this.page.goto('/tasks')
  }

  async createTask(title: string, priority: string = '5') {
    await this.createTaskButton.click()
    await this.page.fill('[name="title"]', title)
    await this.page.selectOption('[name="priority"]', priority)
    await this.page.click('button:has-text("Create")')
  }

  async getTask(title: string) {
    return this.page.locator(`text=${title}`)
  }
}
```

---

## 🔧 Fixtures

### auth.ts

```typescript
import { test as base } from '@playwright/test'
import { LoginPage } from '../page-objects/LoginPage'

type AuthFixtures = {
  loginPage: LoginPage
  loggedInAsStaff: void
  loggedInAsManager: void
}

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },

  loggedInAsStaff: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'staff@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    await use()
  },

  loggedInAsManager: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'manager@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    await use()
  },
})

export { expect } from '@playwright/test'
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/auth'

test('Manager workflow', async ({ page, loggedInAsManager }) => {
  // User is already logged in as manager
  await page.click('text=Tasks')
  // ... rest of test
})
```

---

## 📊 Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🚀 Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test

```bash
npx playwright test e2e/tests/user-registration.spec.ts
```

### Run with UI

```bash
npm run test:e2e:ui
```

### Run in Debug Mode

```bash
npm run test:e2e:debug
```

### View Report

```bash
npm run test:e2e:report
```

---

## 🔄 CI/CD Integration

Update `.github/workflows/test.yml`:

```yaml
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

## 📝 Best Practices

1. **Use Page Object Model** - Keep tests maintainable
2. **Use Fixtures** - Reuse authentication and setup
3. **Use Data Attributes** - `data-testid` for stable selectors
4. **Wait for Elements** - Use `waitFor()` for async operations
5. **Clean Up** - Reset state between tests
6. **Isolate Tests** - Each test should be independent
7. **Use Assertions** - Verify expected behavior
8. **Take Screenshots** - On failure for debugging

---

## 🐛 Debugging

### Run in Debug Mode

```bash
npx playwright test --debug
```

### Run with UI

```bash
npx playwright test --ui
```

### View Trace

```bash
npx playwright show-trace trace.zip
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

---

**Last Updated:** January 2025

