# 测试框架实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为睡眠数据分析平台添加完整的测试体系，包括单元测试、集成测试和 E2E 测试，目标覆盖率 80%。

**Architecture:** 分层测试金字塔 - 单元测试覆盖 lib 层，集成测试覆盖 API 路由，E2E 测试覆盖关键用户流程。使用 Vitest 作为单元/集成测试框架，Playwright 作为 E2E 测试框架。

**Tech Stack:** Vitest, @vitest/coverage-v8, @playwright/test, jsdom

---

## 文件结构

```
__test__/
├── setup.ts                      # 测试环境设置
├── unit/
│   ├── lib/
│   │   ├── auth.test.ts          # 认证工具测试
│   │   ├── csv-parser.test.ts    # CSV 解析测试
│   │   └── ai.test.ts            # AI 服务测试
│   └── validations/
│       └── auth.test.ts          # Zod 验证测试
├── integration/
│   └── api/
│       ├── auth.test.ts          # 认证 API 测试
│       ├── sleep-records.test.ts # 睡眠记录 API 测试
│       └── analyze.test.ts       # AI 分析 API 测试
└── e2e/
    ├── auth.spec.ts              # 认证流程 E2E
    └── dashboard.spec.ts         # 仪表盘 E2E

vitest.config.ts                  # Vitest 配置
playwright.config.ts              # Playwright 配置
```

---

### Task 1: 安装测试依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 Vitest 及相关依赖**

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @types/node
```

- [ ] **Step 2: 安装 Playwright**

```bash
npm install -D @playwright/test
```

- [ ] **Step 3: 安装 Playwright 浏览器依赖**

```bash
npx playwright install-deps chromium
npx playwright install chromium
```

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json
git commit -m "chore: 添加测试框架依赖"
```

---

### Task 2: 配置 Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `__test__/setup.ts`

- [ ] **Step 1: 创建 Vitest 配置文件**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
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
```

- [ ] **Step 2: 创建测试设置文件**

```typescript
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
```

- [ ] **Step 3: 添加 NPM 脚本到 package.json**

在 `package.json` 的 `scripts` 中添加：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add vitest.config.ts __test__/setup.ts package.json
git commit -m "chore: 配置 Vitest 测试框架"
```

---

### Task 3: 单元测试 - Zod 验证

**Files:**
- Create: `__test__/unit/validations/auth.test.ts`

- [ ] **Step 1: 创建测试目录**

```bash
mkdir -p __test__/unit/validations
```

- [ ] **Step 2: 编写验证测试**

```typescript
// __test__/unit/validations/auth.test.ts
import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, sleepRecordSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址')
    }
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: ''
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入密码')
    }
  })
})

describe('registerSchema', () => {
  it('should validate valid register data', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should reject password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码至少 6 个字符')
    }
  })

  it('should reject password longer than 100 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(101)
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码最多 100 个字符')
    }
  })
})

describe('sleepRecordSchema', () => {
  it('should validate valid sleep record', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7.5,
      bedTime: '23:00',
      wakeTime: '06:30'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid date format', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024/01/15',
      sleepDuration: 7.5
    })
    expect(result.success).toBe(false)
  })

  it('should reject sleep duration over 24 hours', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 25
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('睡眠时长不能超过 24 小时')
    }
  })

  it('should reject negative sleep duration', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: -1
    })
    expect(result.success).toBe(false)
  })

  it('should reject sleep score over 100', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      sleepScore: 101
    })
    expect(result.success).toBe(false)
  })

  it('should reject heart rate below 30', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      heartRate: 20
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 3: 运行测试验证**

```bash
npm run test:run __test__/unit/validations/auth.test.ts
```

Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add __test__/unit/validations/auth.test.ts
git commit -m "test: 添加 Zod 验证单元测试"
```

---

### Task 4: 单元测试 - 认证工具

**Files:**
- Create: `__test__/unit/lib/auth.test.ts`

- [ ] **Step 1: 创建测试目录**

```bash
mkdir -p __test__/unit/lib
```

- [ ] **Step 2: 编写认证工具测试**

```typescript
// __test__/unit/lib/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth'

describe('auth utilities', () => {
  describe('hashPassword & verifyPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject wrong password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword('wrongPassword', hashed)
      expect(isValid).toBe(false)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('JWT Token', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
    })

    it('should sign and verify token correctly', async () => {
      const payload = { userId: 'user-123', email: 'test@example.com' }
      const token = await signToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const verified = await verifyToken(token)
      expect(verified).toMatchObject(payload)
    })

    it('should return null for invalid token', async () => {
      const verified = await verifyToken('invalid-token')
      expect(verified).toBeNull()
    })

    it('should return null for empty token', async () => {
      const verified = await verifyToken('')
      expect(verified).toBeNull()
    })
  })
})
```

- [ ] **Step 3: 运行测试验证**

```bash
npm run test:run __test__/unit/lib/auth.test.ts
```

Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add __test__/unit/lib/auth.test.ts
git commit -m "test: 添加认证工具单元测试"
```

---

### Task 5: 单元测试 - CSV 解析

**Files:**
- Create: `__test__/unit/lib/csv-parser.test.ts`

- [ ] **Step 1: 编写 CSV 解析测试**

```typescript
// __test__/unit/lib/csv-parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseCSV, type ParsedSleepData } from '@/lib/csv-parser'

describe('csv-parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV with standard headers', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration,deepSleep,lightSleep,remSleep,awakeCount,sleepScore,heartRate
2024-01-15,23:00,07:00,8,2,4,1.5,1,85,62`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        date: '2024-01-15',
        bedTime: '23:00',
        wakeTime: '07:00',
        sleepDuration: 8,
        deepSleep: 2,
        lightSleep: 4,
        remSleep: 1.5,
        awakeCount: 1,
        sleepScore: 85,
        heartRate: 62
      })
    })

    it('should parse CSV with Chinese headers', async () => {
      const csvText = `日期,入睡时间,醒来时间,睡眠时长,深睡,浅睡,REM,清醒次数,睡眠评分,心率
2024-01-15,23:00,07:00,8,2,4,1.5,1,85,62`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[0].sleepDuration).toBe(8)
    })

    it('should handle missing optional fields', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration
2024-01-15,23:00,07:00,8`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].deepSleep).toBeUndefined()
      expect(result[0].heartRate).toBeUndefined()
    })

    it('should parse multiple rows', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration
2024-01-15,23:00,07:00,8
2024-01-16,00:00,08:00,8
2024-01-17,22:30,06:30,8`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(3)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[1].date).toBe('2024-01-16')
      expect(result[2].date).toBe('2024-01-17')
    })

    it('should handle empty CSV', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(0)
    })

    it('should handle invalid numbers gracefully', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration,deepSleep
2024-01-15,23:00,07:00,invalid,also-invalid`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].sleepDuration).toBeUndefined()
      expect(result[0].deepSleep).toBeUndefined()
    })
  })
})
```

- [ ] **Step 2: 运行测试验证**

```bash
npm run test:run __test__/unit/lib/csv-parser.test.ts
```

Expected: 所有测试通过

- [ ] **Step 3: 提交**

```bash
git add __test__/unit/lib/csv-parser.test.ts
git commit -m "test: 添加 CSV 解析单元测试"
```

---

### Task 6: 单元测试 - AI 服务

**Files:**
- Create: `__test__/unit/lib/ai.test.ts`

- [ ] **Step 1: 编写 AI 服务测试**

```typescript
// __test__/unit/lib/ai.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateSleepAnalysis, aiModel } from '@/lib/ai'

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '这是 AI 分析结果'
                }
              }
            ]
          })
        }
      }
    }))
  }
})

describe('ai service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('generateSleepAnalysis', () => {
    it('should return AI analysis result', async () => {
      const prompt = '分析我的睡眠数据'
      const result = await generateSleepAnalysis(prompt)

      expect(result).toBe('这是 AI 分析结果')
    })

    it('should be available through aiModel.generate', async () => {
      const prompt = '分析我的睡眠数据'
      const result = await aiModel.generate(prompt)

      expect(result).toBe('这是 AI 分析结果')
    })
  })
})
```

- [ ] **Step 2: 运行测试验证**

```bash
npm run test:run __test__/unit/lib/ai.test.ts
```

Expected: 所有测试通过

- [ ] **Step 3: 提交**

```bash
git add __test__/unit/lib/ai.test.ts
git commit -m "test: 添加 AI 服务单元测试"
```

---

### Task 7: 集成测试 - 认证 API

**Files:**
- Create: `__test__/integration/api/auth.test.ts`

- [ ] **Step 1: 创建测试目录**

```bash
mkdir -p __test__/integration/api
```

- [ ] **Step 2: 编写认证 API 测试**

```typescript
// __test__/integration/api/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { POST as logout } from '@/app/api/auth/logout/route'
import { GET as me } from '@/app/api/auth/me/route'
import prisma from '@/lib/prisma'

describe('Auth API', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'password123'

  beforeEach(async () => {
    // 清理测试用户
    await prisma.user.deleteMany({
      where: {
        email: testEmail
      }
    }).catch(() => {})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User'
        })
      })

      const response = await register(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should reject duplicate email', async () => {
      // 第一次注册
      const request1 = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })
      await register(request1)

      // 第二次注册相同邮箱
      const request2 = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })
      const response = await register(request2)

      expect(response.status).toBe(400)
    })

    it('should reject invalid email', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email', password: testPassword })
      })

      const response = await register(request)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // 先注册
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })
      await register(registerRequest)

      // 登录
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })

      const response = await login(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should reject wrong password', async () => {
      // 先注册
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })
      await register(registerRequest)

      // 用错误密码登录
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'wrongpassword' })
      })

      const response = await login(loginRequest)
      expect(response.status).toBe(401)
    })
  })
})
```

- [ ] **Step 3: 运行测试验证**

```bash
npm run test:run __test__/integration/api/auth.test.ts
```

Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add __test__/integration/api/auth.test.ts
git commit -m "test: 添加认证 API 集成测试"
```

---

### Task 8: 集成测试 - 睡眠记录 API

**Files:**
- Create: `__test__/integration/api/sleep-records.test.ts`

- [ ] **Step 1: 编写睡眠记录 API 测试**

```typescript
// __test__/integration/api/sleep-records.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { GET as listRecords, POST as createRecord } from '@/app/api/sleep-records/route'
import { PUT as updateRecord, DELETE as deleteRecord } from '@/app/api/sleep-records/[id]/route'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signToken } from '@/lib/auth'

describe('Sleep Records API', () => {
  let testUserId: string
  let testToken: string
  const testEmail = `sleep-test-${Date.now()}@example.com`

  beforeEach(async () => {
    // 创建测试用户
    const hashedPassword = await hashPassword('password123')
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Sleep Test User'
      }
    })
    testUserId = user.id
    testToken = await signToken({ userId: user.id, email: user.email })

    // 清理睡眠记录
    await prisma.sleepRecord.deleteMany({
      where: { userId: testUserId }
    })
  })

  describe('POST /api/sleep-records', () => {
    it('should create a sleep record', async () => {
      const request = new Request('http://localhost/api/sleep-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${testToken}`
        },
        body: JSON.stringify({
          date: '2024-01-15',
          sleepDuration: 7.5,
          bedTime: '23:00',
          wakeTime: '06:30'
        })
      })

      const response = await createRecord(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sleepDuration).toBe(7.5)
    })
  })

  describe('GET /api/sleep-records', () => {
    it('should list sleep records', async () => {
      // 创建测试记录
      await prisma.sleepRecord.create({
        data: {
          date: new Date('2024-01-15'),
          sleepDuration: 7.5,
          bedTime: new Date('2024-01-15T23:00:00'),
          wakeTime: new Date('2024-01-16T06:30:00'),
          userId: testUserId
        }
      })

      const request = new Request('http://localhost/api/sleep-records', {
        method: 'GET',
        headers: {
          'Cookie': `auth-token=${testToken}`
        }
      })

      const response = await listRecords(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: 运行测试验证**

```bash
npm run test:run __test__/integration/api/sleep-records.test.ts
```

Expected: 所有测试通过

- [ ] **Step 3: 提交**

```bash
git add __test__/integration/api/sleep-records.test.ts
git commit -m "test: 添加睡眠记录 API 集成测试"
```

---

### Task 9: 配置 Playwright

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: 创建 Playwright 配置**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '__test__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

- [ ] **Step 2: 添加 E2E 测试脚本到 package.json**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add playwright.config.ts package.json
git commit -m "chore: 配置 Playwright E2E 测试"
```

---

### Task 10: E2E 测试 - 认证流程

**Files:**
- Create: `__test__/e2e/auth.spec.ts`

- [ ] **Step 1: 创建 E2E 测试目录**

```bash
mkdir -p __test__/e2e
```

- [ ] **Step 2: 编写认证 E2E 测试**

```typescript
// __test__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  const testEmail = `e2e-${Date.now()}@test.com`
  const testPassword = 'password123'

  test('should register a new user', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input#name', 'E2E Test User')
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)

    await page.click('button[type="submit"]')

    // 应该跳转到 dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should login with existing user', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)

    await page.click('button[type="submit"]')

    // 应该跳转到 dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input#email', 'nonexistent@test.com')
    await page.fill('input#password', 'wrongpassword')

    await page.click('button[type="submit"]')

    // 应该显示错误提示
    await expect(page.locator('text=登录失败')).toBeVisible({ timeout: 5000 })
  })

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // 点击退出（假设有退出按钮）
    await page.click('[data-testid="logout-button"]')

    // 应该跳转到首页或登录页
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 })
  })
})
```

- [ ] **Step 3: 提交**

```bash
git add __test__/e2e/auth.spec.ts
git commit -m "test: 添加认证流程 E2E 测试"
```

---

### Task 11: E2E 测试 - Dashboard

**Files:**
- Create: `__test__/e2e/dashboard.spec.ts`

- [ ] **Step 1: 编写 Dashboard E2E 测试**

```typescript
// __test__/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('input#email', 'e2e@test.com')
    await page.fill('input#password', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(/仪表盘|Dashboard/i)
  })

  test('should show sleep data charts', async ({ page }) => {
    // 检查图表是否存在
    const charts = page.locator('[data-testid="sleep-chart"], canvas')
    await expect(charts.first()).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to history page', async ({ page }) => {
    await page.click('a[href="/history"]')
    await expect(page).toHaveURL(/\/history/)
  })
})
```

- [ ] **Step 2: 提交**

```bash
git add __test__/e2e/dashboard.spec.ts
git commit -m "test: 添加 Dashboard E2E 测试"
```

---

### Task 12: 运行完整测试并生成覆盖率报告

**Files:**
- None

- [ ] **Step 1: 运行所有单元和集成测试**

```bash
npm run test:run
```

Expected: 所有测试通过

- [ ] **Step 2: 生成覆盖率报告**

```bash
npm run test:coverage
```

Expected: 覆盖率达到 80%

- [ ] **Step 3: 运行 E2E 测试**

```bash
npm run test:e2e
```

Expected: 所有 E2E 测试通过

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "test: 完成测试框架搭建"
```

---

### Task 13: 更新文档

**Files:**
- Create: `agents/testing.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: 创建测试文档**

```markdown
# 测试规范

## 测试框架

| 类型 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Vitest | lib/*.ts、validations |
| 集成测试 | Vitest | API 路由 |
| E2E 测试 | Playwright | 关键用户流程 |

## 目录结构

```
__test__/
├── unit/           # 单元测试
├── integration/    # 集成测试
└── e2e/            # E2E 测试
```

## 常用命令

```bash
npm run test          # 运行测试（watch 模式）
npm run test:run      # 运行测试（单次）
npm run test:coverage # 生成覆盖率报告
npm run test:e2e      # 运行 E2E 测试
```

## 测试原则

1. **TDD**: 先写测试，再写实现
2. **隔离**: 每个测试独立，不依赖其他测试
3. **清晰**: 测试名称描述清楚预期行为
4. **覆盖**: 测试正常路径和边界情况
```

- [ ] **Step 2: 更新 AGENTS.md 快速导航**

在快速导航表格中添加：

```markdown
| [testing.md](agents/testing.md) | 测试规范 |
```

- [ ] **Step 3: 提交**

```bash
git add agents/testing.md AGENTS.md
git commit -m "docs: 添加测试规范文档"
```
