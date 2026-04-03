// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

// Unit test config - run with: npm run test:run
// Integration tests have their own config (vitest.config.integration.ts)
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['__test__/unit/**/*.test.ts'],
    exclude: ['__test__/e2e/**', '__test__/integration/**', 'node_modules/**'],
    setupFiles: ['__test__/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/lib/validations/**/*.ts'],
      exclude: ['src/lib/prisma.ts', 'src/lib/utils.ts'],
      thresholds: {
        lines: 60,
        functions: 65,
        branches: 35,
        statements: 60,
      },
    },
  },
});
