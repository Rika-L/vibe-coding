// __test__/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { join } from 'path'
import fs from 'fs'

const testDbPath = join(process.cwd(), 'prisma', 'test.db')

beforeAll(async () => {
  // 设置测试数据库
  process.env.DATABASE_URL = `file:${testDbPath}`
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

  // 运行迁移
  execSync('npx prisma migrate deploy', { stdio: 'pipe' })
})

afterEach(async () => {
  // 每个测试后清理数据（可选）
})

afterAll(async () => {
  // 清理测试数据库
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath)
  }
})
