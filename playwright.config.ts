import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * 
 * These tests open a real browser and interact with the application.
 * Data is written to Firestore Emulator (not production database).
 * 
 * Prerequisites:
 * 1. Start Firestore Emulator: firebase emulators:start --only firestore
 * 2. Build the app: npm run build
 * 3. Run tests: npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'], // Console output only
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // HTML report but don't auto-open
  ],
  
  use: {
    baseURL: 'http://localhost:4173', // Vite preview server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Run in headless mode by default (no browser window)
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start preview server before running tests
  webServer: {
    command: 'npm run build:e2e && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // Environment variables are set in build:e2e script (must be at build time for Vite)
    env: {
      // These are for runtime (if needed by preview server)
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      USE_FIREBASE_EMULATOR: 'true',
      VITE_E2E_TEST_MODE: 'true',
      // Auth Emulator (if needed)
      VITE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      AUTH_EMULATOR_HOST: '127.0.0.1:9099',
    },
  },
})

