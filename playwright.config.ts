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
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Point app to Firestore Emulator during tests
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      USE_FIREBASE_EMULATOR: 'true',
      // Enable E2E test page in preview mode
      VITE_E2E_TEST_MODE: 'true',
      // Vite-specific environment variables
      VITE_USE_FIREBASE_EMULATOR: 'true',
      VITE_FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    },
  },
})

