// vitest.config.components.ts
// Component tests that need jsdom environment
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__test__/unit/components/**/*.test.tsx'],
    exclude: ['node_modules/**'],
    setupFiles: ['__test__/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 10000,
  },
})
