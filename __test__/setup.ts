// __test__/setup.ts
import { beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { join } from 'path'
import fs from 'fs'

const testDbPath = join(process.cwd(), 'prisma', 'test.db')

// Set environment variables immediately (before any modules are imported)
process.env.DATABASE_URL = `file:${testDbPath}`
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

beforeAll(async () => {
  // Ensure prisma directory exists
  const prismaDir = join(process.cwd(), 'prisma')
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true })
  }

  // Remove existing test database to start fresh
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore errors
    }
  }

  // Run migrations
  execSync('npx prisma migrate deploy', { stdio: 'pipe' })
})

afterAll(async () => {
  // Clean up test database only after all tests complete
  // Small delay to ensure all connections are closed
  await new Promise(resolve => setTimeout(resolve, 100))

  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore cleanup errors on Windows/WSL
    }
  }
})
