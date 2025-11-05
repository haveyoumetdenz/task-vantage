import { test, expect } from '@playwright/test'

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
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
    
    // Navigate to E2E test page
    await page.goto('/e2e-test')
    await page.waitForLoadState('networkidle')
  })

  test('should create a task through E2E test page', async ({ page }) => {
    // Wait for the create task form to be visible
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Fill in task details
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
    await page.fill('[data-testid="task-description-input"]', 'Task created via E2E test page')
    
    // Set priority (default is 5, but let's set it explicitly)
    await page.locator('[data-testid="task-priority-select"]').click()
    await page.locator('text=5').click()
    
    // Submit the form
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for success message or task ID to appear
    await expect(
      page.locator('[data-testid="task-created-id"], text=/Task created/i, text=/success/i').first()
    ).toBeVisible({ timeout: 10000 })
    
    // Verify task was created by checking for the task ID
    const taskIdElement = page.locator('[data-testid="task-created-id"]')
    if (await taskIdElement.isVisible({ timeout: 2000 })) {
      const taskIdText = await taskIdElement.textContent()
      expect(taskIdText).toContain('Last created:')
    }
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

