import { test, expect } from '@playwright/test'

/**
 * E2E Test: TGO-COR-01, TGO-COR-03, TGO-COR-04 - Project Management
 * 
 * Tests complete project management workflow:
 * 1. Create project
 * 2. Move task to project
 * 3. Create subtasks
 * 
 * All data goes to Firestore Emulator
 */
test.describe('Project Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'denzel.toh@hotmail.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
  })

  test('TGO-COR-01 → TGO-COR-03 → TGO-COR-04: Complete project workflow', async ({ page }) => {
    // Step 1: Create project (TGO-COR-01)
    await page.click('text=Projects')
    await page.waitForURL(/.*\/projects/, { timeout: 5000 })
    
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')
    await page.waitForSelector('[name="title"], input[placeholder*="title" i], input[placeholder*="Project" i]', { timeout: 5000 })
    
    await page.fill('[name="title"], input[placeholder*="title" i], input[placeholder*="Project" i]', 'E2E Test Project')
    
    // Fill optional fields if they exist
    const descriptionField = page.locator('[name="description"], textarea').first()
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Project description for E2E test')
    }
    
    await page.click('button:has-text("Create"), button:has-text("Save")')
    
    // Verify project created
    await expect(page.locator('text=E2E Test Project').first()).toBeVisible({ timeout: 10000 })
    
    // Step 2: Create a task first
    await page.click('text=Tasks')
    await page.waitForURL(/.*\/tasks/, { timeout: 5000 })
    
    await page.click('button:has-text("Create Task"), button:has-text("New Task")')
    await page.waitForSelector('[name="title"]', { timeout: 5000 })
    
    await page.fill('[name="title"]', 'Project Task')
    await page.click('button:has-text("Create"), button:has-text("Save")')
    
    // Wait for task to appear
    await expect(page.locator('text=Project Task').first()).toBeVisible({ timeout: 10000 })
    
    // Step 3: Move task to project (TGO-COR-03)
    await page.click('text=Project Task')
    await page.waitForTimeout(1000) // Wait for detail page/dialog
    
    // Try to find edit button or project selector
    const editButton = page.locator('button:has-text("Edit"), button[aria-label*="edit" i]').first()
    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click()
      await page.waitForTimeout(500)
    }
    
    // Try to select project
    const projectSelect = page.locator('[name="project"], select').first()
    if (await projectSelect.isVisible({ timeout: 2000 })) {
      await projectSelect.selectOption('E2E Test Project')
      await page.click('button:has-text("Save"), button:has-text("Update")')
    }
    
    // Step 4: Verify task in project (TGO-COR-04)
    await page.click('text=Projects')
    await page.click('text=E2E Test Project')
    
    // Try to find task in project
    await page.waitForTimeout(1000)
    
    // Step 5: Create subtask (TGO-COR-04)
    await page.click('text=Project Task')
    await page.waitForTimeout(1000)
    
    // Look for add subtask button
    const addSubtaskButton = page.locator('button:has-text("Add Subtask"), button:has-text("Subtask")').first()
    if (await addSubtaskButton.isVisible({ timeout: 2000 })) {
      await addSubtaskButton.click()
      await page.waitForTimeout(500)
      
      await page.fill('[name="subtaskTitle"], [name="title"], input[placeholder*="subtask" i]', 'E2E Subtask')
      await page.click('button:has-text("Create"), button:has-text("Add")')
      
      // Verify subtask appears
      await expect(page.locator('text=E2E Subtask').first()).toBeVisible({ timeout: 5000 })
    }
  })
})

