import { test, expect } from '@playwright/test'

/**
 * E2E Test: TGO-COR-01 - Create Project (Using E2E Test Page)
 * 
 * This test uses the dedicated E2E test page for faster testing.
 */
test.describe('TGO-COR-01: Create Project (E2E Test Page)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'denzel.toh@hotmail.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
    
    // Navigate to E2E test page
    await page.goto('/e2e-test')
    await page.waitForLoadState('networkidle')
  })

  test('should create a project through E2E test page', async ({ page }) => {
    // Wait for the create project form
    await page.waitForSelector('[data-testid="create-project-form"]', { timeout: 5000 })
    
    // Fill in project details
    await page.fill('[data-testid="project-title-input"]', 'E2E Test Project')
    await page.fill('[data-testid="project-description-input"]', 'Project created via E2E test page')
    
    // Status is already set to 'active' by default
    
    // Submit the form
    await page.click('[data-testid="create-project-submit"]')
    
    // Wait for success message or project ID
    await expect(
      page.locator('[data-testid="project-created-id"], text=/Project created/i, text=/success/i').first()
    ).toBeVisible({ timeout: 10000 })
    
    // Verify project was created
    const projectIdElement = page.locator('[data-testid="project-created-id"]')
    if (await projectIdElement.isVisible({ timeout: 2000 })) {
      const projectIdText = await projectIdElement.textContent()
      expect(projectIdText).toBeTruthy()
      expect(projectIdText).toContain('Last created:')
    }
  })
})

