// vitest.config.integration.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

// Integration test config - run with: npx vitest run -c vitest.config.integration.ts
// This runs in isolation from unit tests to avoid PrismaClient caching issues
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['__test__/integration/**/*.test.ts'],
    exclude: ['node_modules/**'],
    setupFiles: ['__test__/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 10000,
    // Run with isolation to avoid conflicts
    isolate: true,
  },
})
