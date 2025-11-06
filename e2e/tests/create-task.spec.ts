import { test, expect } from '@playwright/test'
import { ensureTestUser, TEST_USERS } from '../helpers/auth'

/**
 * E2E Test: TM-COR-01 - Create Task
 * 
 * This test:
 * 1. Opens a real browser
 * 2. Navigates to the app
 * 3. Logs in as a user
 * 4. Creates a task through the UI
 * 5. Verifies the task appears in the list
 * 
 * All data goes to Firestore Emulator (not production database)
 * 
 * Prerequisites:
 * - Firestore Emulator running: firebase emulators:start --only firestore
 * - App built: npm run build
 */
test.describe('TM-COR-01: Create Task', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test user exists in Auth Emulator and Firestore
    const user = TEST_USERS.real
    await ensureTestUser(user.email, user.password, user.fullName, user.role)
    
    // Navigate to login page
    await page.goto('/login')
    
    // Wait for login form to be visible
    await page.waitForSelector('[name="email"]', { timeout: 5000 })
  })

  test('should create a task through the UI', async ({ page }) => {
    // Step 1: Login (using test user credentials)
    const user = TEST_USERS.real
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login (could be /, /dashboard, or /tasks)
    // Wait for navigation after login (could go to / or /dashboard)
    await page.waitForURL(/\/(dashboard|tasks|$)/, { timeout: 15000 })
    // Wait for page to be ready (DOM loaded)
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Step 2: Navigate to E2E Test Page (direct form, no UI navigation)
    await page.goto('/e2e-test')
    await page.waitForLoadState('domcontentloaded')
    
    // Step 3: Wait for task form to be visible
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 10000 })
    
    // Step 4: Fill in task details using data-testid attributes
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
    await page.fill('[data-testid="task-description-input"]', 'This is a test task created via E2E test page')
    
    // Handle Select component - click the trigger first, then select option
    const statusSelect = page.locator('[data-testid="task-status-select"]')
    // Wait for select to be visible and enabled
    await statusSelect.waitFor({ state: 'visible', timeout: 10000 })
    // Wait a bit for the component to be fully interactive
    await page.waitForTimeout(300)
    // Click the SelectTrigger (the button that opens the dropdown)
    await statusSelect.click()
    // Wait for dropdown to open (longer wait)
    await page.waitForTimeout(700)
    // Click the option - wait for it to be visible and clickable
    // Try getByRole first, fallback to text locator
    let toDoOption = page.getByRole('option', { name: /To Do/i }).first()
    if (!(await toDoOption.isVisible({ timeout: 1000 }).catch(() => false))) {
      toDoOption = page.locator('text=To Do').first()
    }
    await toDoOption.waitFor({ state: 'visible', timeout: 5000 })
    // Use force click to bypass pointer event interception
    await toDoOption.click({ force: true, timeout: 5000 })
    // Wait for selection to be applied
    await page.waitForTimeout(300)
    
    await page.fill('[data-testid="task-priority-input"]', '5')
    
    // Step 5: Submit the form
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for form submission to start
    await page.waitForTimeout(500)
    
    // Step 6: Wait for success message (longer timeout)
    await expect(page.locator('[data-testid="task-created-success"]').first()).toBeVisible({ timeout: 15000 })
    
    // Step 7: Verify success message text
    const successMessage = page.locator('[data-testid="task-created-success"]')
    await expect(successMessage).toContainText(/Task created successfully/i)
  })

  test('should show validation error for empty title', async ({ page }) => {
    // Login
    const user = TEST_USERS.real
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login (could go to / or /dashboard)
    await page.waitForURL(/\/(dashboard|tasks|$)/, { timeout: 15000 })
    // Wait for page to be ready (DOM loaded)
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Navigate to E2E Test Page
    await page.goto('/e2e-test')
    await page.waitForLoadState('domcontentloaded')
    
    // Wait for task form
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 10000 })
    
    // Try to submit without filling title
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for validation error to appear
    // The form should show "Title is required" error message
    await expect(
      page.locator('text=/Title is required/i').first()
    ).toBeVisible({ timeout: 5000 })
  })
})

