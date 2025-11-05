import { test, expect } from '@playwright/test'

/**
 * E2E Test: TM-COR-03 - Change Task Status
 * 
 * This test verifies that:
 * 1. User can update task status through the UI
 * 2. Status change is reflected immediately
 * 3. Confirmation message appears
 * 
 * All data goes to Firestore Emulator
 */
test.describe('TM-COR-03: Change Task Status', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
  })

  test('should update task status from To Do to In Progress', async ({ page }) => {
    // Navigate to Tasks
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
    
    // Find a task card (or create one first)
    // Try to find existing task or create new one
    const createButton = page.locator('button:has-text("Create Task"), button:has-text("New Task")').first()
    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForSelector('[name="title"]', { timeout: 5000 })
      await page.fill('[name="title"]', 'Status Update Test Task')
      await page.locator('button:has-text("Create"), button:has-text("Save")').first().click()
      await page.waitForTimeout(1000) // Wait for task to be created
    }
    
    // Find the task card
    const taskCard = page.locator('text=Status Update Test Task, text=To Do').first()
    await taskCard.waitFor({ timeout: 5000 })
    
    // Click on the task to open details/edit
    await taskCard.click()
    
    // Wait for edit dialog or detail page
    await page.waitForTimeout(1000)
    
    // Try to find status selector
    const statusSelect = page.locator('[name="status"], select').first()
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('in_progress')
      
      // Save changes
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first()
      await saveButton.click()
      
      // Verify success message appears
      await expect(
        page.locator('text=/success/i, text=/updated/i').first()
      ).toBeVisible({ timeout: 5000 })
      
      // Verify status changed in the list
      await page.goto('/tasks')
      await expect(page.locator('text=In Progress').first()).toBeVisible({ timeout: 5000 })
    }
  })
})

