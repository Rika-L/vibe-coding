// vitest.config.ts
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
    environment: 'node',
    include: ['__test__/**/*.test.ts'],
    exclude: ['__test__/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/lib/validations/**/*.ts'],
      exclude: ['src/lib/prisma.ts', 'src/lib/utils.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    testTimeout: 15000,
    hookTimeout: 10000,
  },
})
