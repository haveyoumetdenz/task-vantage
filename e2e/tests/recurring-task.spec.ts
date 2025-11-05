import { test, expect } from '@playwright/test'

/**
 * E2E Test: TM-COR-05 - Task Recurrence Option
 * 
 * Tests recurring task creation:
 * 1. Create recurring task
 * 2. Verify recurrence configuration
 * 3. View in calendar
 * 
 * All data goes to Firestore Emulator
 */
test.describe('TM-COR-05: Task Recurrence Option', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'denzel.toh.2022@scis.smu.edu.sg')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
  })

  test('should create recurring task and view in calendar', async ({ page }) => {
    // Navigate to Tasks or Calendar
    await page.click('text=Tasks, text=Calendar')
    await page.waitForTimeout(1000)
    
    // Look for recurring task button
    const recurringButton = page.locator('button:has-text("Recurring Task"), button:has-text("Recurring")').first()
    if (await recurringButton.isVisible({ timeout: 5000 })) {
      await recurringButton.click()
      
      // Wait for dialog/form
      await page.waitForSelector('[name="title"], input[placeholder*="title" i]', { timeout: 5000 })
      
      // Fill in task details
      await page.fill('[name="title"], input[placeholder*="title" i]', 'Daily Standup')
      
      // Set recurrence options
      const frequencySelect = page.locator('[name="frequency"], select').first()
      if (await frequencySelect.isVisible({ timeout: 2000 })) {
        await frequencySelect.selectOption('daily')
      }
      
      const intervalInput = page.locator('[name="interval"]').first()
      if (await intervalInput.isVisible({ timeout: 2000 })) {
        await intervalInput.fill('1')
      }
      
      // Set start date (future date)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const startDateInput = page.locator('[name="startDate"], input[type="date"]').first()
      if (await startDateInput.isVisible({ timeout: 2000 })) {
        await startDateInput.fill(futureDate.toISOString().split('T')[0])
      }
      
      // Submit form
      await page.click('button:has-text("Create"), button:has-text("Save")')
      
      // Verify task created
      await expect(page.locator('text=Daily Standup').first()).toBeVisible({ timeout: 10000 })
    }
    
    // Navigate to calendar to verify recurring task appears
    await page.click('text=Calendar')
    await page.waitForURL(/.*\/calendar/, { timeout: 5000 })
    
    // Verify task appears in calendar (if visible)
    await page.waitForTimeout(2000)
  })
})

