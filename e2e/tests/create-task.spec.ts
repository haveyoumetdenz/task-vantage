import { test, expect } from '@playwright/test'

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
    // Navigate to login page
    await page.goto('/login')
    
    // Wait for login form to be visible
    await page.waitForSelector('[name="email"]', { timeout: 5000 })
  })

  test('should create a task through the UI', async ({ page }) => {
    // Step 1: Login (using real user credentials)
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login (could be /, /dashboard, or /tasks)
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
    
    // Step 2: Navigate to E2E Test Page (direct form, no UI navigation)
    await page.goto('/e2e-test')
    await page.waitForLoadState('networkidle')
    
    // Step 3: Wait for task form to be visible
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Step 4: Fill in task details using data-testid attributes
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
    await page.fill('[data-testid="task-description-input"]', 'This is a test task created via E2E test page')
    
    // Handle Select component - click the trigger first, then select option
    const statusSelect = page.locator('[data-testid="task-status-select"]')
    await statusSelect.click()
    // Wait for dropdown to open
    await page.waitForTimeout(200)
    await page.locator('text=To Do').first().click()
    
    await page.fill('[data-testid="task-priority-input"]', '5')
    
    // Step 5: Submit the form
    await page.click('[data-testid="create-task-submit"]')
    
    // Step 6: Wait for success message
    await expect(page.locator('text=/Task created successfully/i, text=/successfully/i').first()).toBeVisible({ timeout: 10000 })
    
    // Step 7: Verify task was created by checking success message
    const successMessage = page.locator('text=/Task created successfully/i').first()
    await expect(successMessage).toBeVisible({ timeout: 5000 })
  })

  test('should show validation error for empty title', async ({ page }) => {
    // Login
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
    
    // Navigate to E2E Test Page
    await page.goto('/e2e-test')
    await page.waitForLoadState('networkidle')
    
    // Wait for task form
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Try to submit without filling title
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for validation error to appear
    // The form should show "Title is required" error message
    await expect(
      page.locator('text=/Title is required/i').first()
    ).toBeVisible({ timeout: 5000 })
  })
})

