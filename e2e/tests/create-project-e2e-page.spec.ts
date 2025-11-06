import { test, expect } from '@playwright/test'
import { ensureTestUser, TEST_USERS } from '../helpers/auth'

/**
 * E2E Test: TGO-COR-01 - Create Project (Using E2E Test Page)
 * 
 * This test uses the dedicated E2E test page for faster testing.
 */

test.describe('TGO-COR-01: Create Project (E2E Test Page)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test user exists in Auth Emulator and Firestore
    const user = TEST_USERS.staff
    await ensureTestUser(user.email, user.password, user.fullName, user.role)
    
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    // Wait for navigation after login (could go to / or /dashboard)
    await page.waitForURL(/\/(dashboard|tasks|$)/, { timeout: 15000 })
    // Wait for page to be ready (DOM loaded)
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Navigate to E2E test page
    await page.goto('/e2e-test')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should create a project through E2E test page', async ({ page }) => {
    // Wait for the create project form
    await page.waitForSelector('[data-testid="create-project-form"]', { timeout: 10000 })
    
    // Fill in project details
    await page.fill('[data-testid="project-title-input"]', 'E2E Test Project')
    await page.fill('[data-testid="project-description-input"]', 'Project created via E2E test page')
    
    // Status is already set to 'active' by default
    
    // Wait for form to be ready
    await page.waitForTimeout(300)
    
    // Submit the form
    await page.click('[data-testid="create-project-submit"]')
    
    // Wait for form submission to process and check for either success or error
    await page.waitForTimeout(1000)
    
    // Wait for either success or error message to appear
    await expect(
      page.locator('[data-testid="project-created-success"], [data-testid="project-created-error"]').first()
    ).toBeVisible({ timeout: 15000 })
    
    // Verify it's a success message (not error)
    const resultMessage = page.locator('[data-testid="project-created-success"], [data-testid="project-created-error"]').first()
    const testId = await resultMessage.getAttribute('data-testid')
    if (testId === 'project-created-error') {
      // Log the error message for debugging
      const errorText = await resultMessage.textContent()
      throw new Error(`Project creation failed: ${errorText}`)
    }
    
    // Wait for success message specifically
    await expect(
      page.locator('[data-testid="project-created-success"]').first()
    ).toBeVisible({ timeout: 5000 })
    
    // Verify success message text
    const successMessage = page.locator('[data-testid="project-created-success"]')
    await expect(successMessage).toContainText(/Project created successfully/i)
  })
})

