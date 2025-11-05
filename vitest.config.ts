/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    css: true,
    // Exclude E2E tests (they're run by Playwright)
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.e2e.spec.ts', '**/*.e2e.test.ts'],
    // Optimize for faster execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Increase timeout to prevent issues with emulator timing
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/utils/**/*.ts'],
      exclude: [
        'src/test/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
