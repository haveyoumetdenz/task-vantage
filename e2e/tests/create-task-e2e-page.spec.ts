import { test, expect } from '@playwright/test'
import { ensureTestUser, TEST_USERS } from '../helpers/auth'

/**
 * E2E Test: TM-COR-01 - Create Task (Using E2E Test Page)
 * 
 * This test uses the dedicated E2E test page for faster, more reliable testing:
 * - No UI navigation needed
 * - Direct form interaction
 * - Faster execution
 * 
 * All data goes to Firestore Emulator (not production database)
 */
test.describe('TM-COR-01: Create Task (E2E Test Page)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test user exists in Auth Emulator and Firestore
    const user = TEST_USERS.real
    await ensureTestUser(user.email, user.password, user.fullName, user.role)
    
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login
    // Wait for navigation after login (could go to / or /dashboard)
    await page.waitForURL(/\/(dashboard|tasks|$)/, { timeout: 15000 })
    // Wait for page to be ready (DOM loaded)
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Navigate to E2E test page
    await page.goto('/e2e-test')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should create a task through E2E test page', async ({ page }) => {
    // Wait for the create task form to be visible
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 10000 })
    
    // Fill in task details
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
    await page.fill('[data-testid="task-description-input"]', 'Task created via E2E test page')
    
    // Set priority (default is 5, but let's set it explicitly)
    // Priority is an Input field, not a Select - just fill it
    await page.fill('[data-testid="task-priority-input"]', '5')
    
    // Wait for form to be ready
    await page.waitForTimeout(300)
    
    // Submit the form
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for form submission to process
    await page.waitForTimeout(500)
    
    // Wait for success message (longer timeout)
    await expect(
      page.locator('[data-testid="task-created-success"]').first()
    ).toBeVisible({ timeout: 15000 })
    
    // Verify success message text
    const successMessage = page.locator('[data-testid="task-created-success"]')
    await expect(successMessage).toContainText(/Task created successfully/i)
  })

  test('should show validation error for empty title', async ({ page }) => {
    // Wait for the create task form
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Try to submit without filling title
    // The form should have required attribute, but let's try submitting anyway
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait a bit for validation
    await page.waitForTimeout(500)
    
    // Check if browser validation is preventing submission
    // OR if there's a visible error message
    const titleInput = page.locator('[data-testid="task-title-input"]')
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    
    // Either the form didn't submit (browser validation) or there's an error message
    expect(isInvalid || await page.locator('text=/required/i').count() > 0).toBeTruthy()
  })
})

