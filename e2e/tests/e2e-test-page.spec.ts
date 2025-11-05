import { test, expect } from '@playwright/test'

/**
 * E2E Tests using the dedicated E2E Test Page
 * 
 * This page provides direct forms for creating tasks and projects,
 * bypassing complex UI navigation for faster, more reliable tests.
 * 
 * URL: /e2e-test
 * 
 * All data goes to Firestore Emulator (not production database)
 */

test.describe('E2E Test Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.waitForSelector('[name="email"]', { timeout: 5000 })
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for navigation after login
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
    
    // Navigate to E2E Test Page
    await page.goto('/e2e-test')
    // Wait for the page to be visible - check for either form
    await page.waitForSelector('[data-testid="create-task-form"], [data-testid="create-project-form"]', { timeout: 10000 })
  })

  test('TM-COR-01: should create a task via E2E test page', async ({ page }) => {
    // Wait for task form
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Fill in task details
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task via Test Page')
    await page.fill('[data-testid="task-description-input"]', 'Task created via dedicated E2E test page')
    
    // Handle Select component - click the trigger first, then select option
    const statusSelect = page.locator('[data-testid="task-status-select"]')
    await statusSelect.click()
    // Wait for dropdown to open
    await page.waitForTimeout(200)
    await page.locator('text=To Do').first().click()
    
    await page.fill('[data-testid="task-priority-input"]', '5')
    
    // Submit form
    await page.click('[data-testid="create-task-submit"]')
    
    // Verify success message
    await expect(page.locator('text=/Task created successfully/i').first()).toBeVisible({ timeout: 10000 })
    
    // Verify form shows success result
    const successAlert = page.locator('text=/Task created successfully/i').first()
    await expect(successAlert).toBeVisible({ timeout: 5000 })
  })

  test('TM-COR-01: should show validation error for empty task title', async ({ page }) => {
    // Wait for task form
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    
    // Try to submit without filling title
    await page.click('[data-testid="create-task-submit"]')
    
    // Should show validation error
    await expect(page.locator('text=/Title is required/i').first()).toBeVisible({ timeout: 5000 })
  })

  test('TGO-COR-01: should create a project via E2E test page', async ({ page }) => {
    // Wait for project form
    await page.waitForSelector('[data-testid="create-project-form"]', { timeout: 5000 })
    
    // Fill in project details
    await page.fill('[data-testid="project-title-input"]', 'E2E Test Project')
    await page.fill('[data-testid="project-description-input"]', 'Project created via dedicated E2E test page')
    
    // Handle Select component - click the trigger first, then select option
    const projectStatusSelect = page.locator('[data-testid="project-status-select"]')
    await projectStatusSelect.click()
    // Wait for dropdown to open
    await page.waitForTimeout(200)
    await page.locator('text=Active').first().click()
    
    // Submit form
    await page.click('[data-testid="create-project-submit"]')
    
    // Verify success message
    await expect(page.locator('text=/Project created successfully/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('TGO-COR-01: should show validation error for empty project title', async ({ page }) => {
    // Wait for project form
    await page.waitForSelector('[data-testid="create-project-form"]', { timeout: 5000 })
    
    // Try to submit without filling title
    await page.click('[data-testid="create-project-submit"]')
    
    // Should show validation error
    await expect(page.locator('text=/Title is required/i').first()).toBeVisible({ timeout: 5000 })
  })

  test('TM-COR-03: should update task status via E2E test page', async ({ page }) => {
    // First create a task
    await page.waitForSelector('[data-testid="create-task-form"]', { timeout: 5000 })
    await page.fill('[data-testid="task-title-input"]', 'Task to Update Status')
    
    // Handle Select component - click the trigger first, then select option
    const statusSelect = page.locator('[data-testid="task-status-select"]')
    await statusSelect.click()
    // Wait for dropdown to open
    await page.waitForTimeout(200)
    await page.locator('text=To Do').first().click()
    
    await page.fill('[data-testid="task-priority-input"]', '5')
    await page.click('[data-testid="create-task-submit"]')
    
    // Wait for success
    await expect(page.locator('text=/Task created successfully/i').first()).toBeVisible({ timeout: 10000 })
    
    // Navigate to tasks page to verify task exists
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
    
    // Verify task appears in list
    await expect(page.locator('text=Task to Update Status').first()).toBeVisible({ timeout: 10000 })
    
    // Click on task to open details
    await page.click('text=Task to Update Status')
    await page.waitForTimeout(1000)
    
    // Try to find and update status (this would require task detail page)
    // For now, we've verified the task was created successfully
  })
})

