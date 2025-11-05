import { test as base } from '@playwright/test'
import { Page } from '@playwright/test'

/**
 * Authentication fixture for E2E tests
 * 
 * This fixture:
 * 1. Sets up test users in Firebase Auth Emulator
 * 2. Provides login helper
 * 3. Handles authentication state
 */

type AuthFixtures = {
  authenticatedPage: Page
  loginAsTestUser: () => Promise<void>
  loginAsStaffUser: () => Promise<void>
}

// Test user credentials
const TEST_USERS = {
  test: {
    email: 'test@example.com',
    password: 'password123',
  },
  staff: {
    email: 'staff@example.com',
    password: 'password123',
  },
}

/**
 * Create test user in Firebase Auth Emulator
 * Note: This requires Auth Emulator to be running
 */
async function ensureTestUser(email: string, password: string) {
  try {
    // Try to create user via Firebase Auth Emulator REST API
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    })
    
    if (response.ok) {
      console.log(`✅ Test user created: ${email}`)
    } else {
      // User might already exist, that's fine
      const data = await response.json()
      if (data.error?.message?.includes('EMAIL_EXISTS')) {
        console.log(`ℹ️  Test user already exists: ${email}`)
      } else {
        console.warn(`⚠️  Could not create test user ${email}:`, data)
      }
    }
  } catch (error) {
    // Auth emulator might not be running, that's okay - we'll handle it in tests
    console.warn(`⚠️  Auth Emulator not available, skipping user creation: ${error}`)
  }
}

export const test = base.extend<AuthFixtures>({
  // Login helper for test user
  loginAsTestUser: async ({ page }, use) => {
    await use(async () => {
      await ensureTestUser(TEST_USERS.test.email, TEST_USERS.test.password)
      
      await page.goto('/login')
      await page.waitForSelector('[name="email"]', { timeout: 5000 })
      
      await page.fill('[name="email"]', TEST_USERS.test.email)
      await page.fill('[name="password"]', TEST_USERS.test.password)
      await page.click('button[type="submit"]')
      
      // Wait for navigation or check for error
      try {
        await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
      } catch (error) {
        // Check if there's an error message
        const errorMessage = await page.locator('text=/error|invalid|failed/i').first().textContent().catch(() => null)
        if (errorMessage) {
          throw new Error(`Login failed: ${errorMessage}`)
        }
        throw new Error(`Login timeout - page is still at ${page.url()}`)
      }
    })
  },

  // Login helper for staff user
  loginAsStaffUser: async ({ page }, use) => {
    await use(async () => {
      await ensureTestUser(TEST_USERS.staff.email, TEST_USERS.staff.password)
      
      await page.goto('/login')
      await page.waitForSelector('[name="email"]', { timeout: 5000 })
      
      await page.fill('[name="email"]', TEST_USERS.staff.email)
      await page.fill('[name="password"]', TEST_USERS.staff.password)
      await page.click('button[type="submit"]')
      
      try {
        await page.waitForURL(/.*\/(dashboard|tasks|$)/, { timeout: 10000 })
      } catch (error) {
        const errorMessage = await page.locator('text=/error|invalid|failed/i').first().textContent().catch(() => null)
        if (errorMessage) {
          throw new Error(`Login failed: ${errorMessage}`)
        }
        throw new Error(`Login timeout - page is still at ${page.url()}`)
      }
    })
  },

  // Pre-authenticated page
  authenticatedPage: async ({ page, loginAsTestUser }, use) => {
    await loginAsTestUser()
    await use(page)
  },
})

export { expect } from '@playwright/test'

