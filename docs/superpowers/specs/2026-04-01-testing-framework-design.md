# 测试框架设计文档

## 概述

为睡眠数据分析平台添加完整的测试体系，包括单元测试、集成测试和 E2E 测试，目标覆盖率 80%。

## 技术选型

| 层级 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Vitest | 测试 lib/*.ts、validations、utils |
| 集成测试 | Vitest + Prisma Test DB | 测试 API 路由 |
| E2E 测试 | Playwright | 测试关键用户流程 |

## 目录结构

```
__test__/
├── unit/                    # 单元测试
│   ├── lib/
│   │   ├── auth.test.ts
│   │   ├── csv-parser.test.ts
│   │   ├── ai.test.ts
│   │   └── utils.test.ts
│   └── validations/
│       └── auth.test.ts
├── integration/             # 集成测试
│   └── api/
│       ├── auth.test.ts
│       ├── sleep-records.test.ts
│       ├── upload.test.ts
│       └── analyze.test.ts
└── e2e/                     # E2E 测试
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── upload.spec.ts
```

## 配置文件

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__test__/**/*.test.ts'],
    exclude: ['__test__/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'],
      exclude: ['src/lib/prisma.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    setupFiles: ['./__test__/setup.ts'],
    testTimeout: 10000,
  },
})
```

### playwright.config.ts

```typescript
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
  },
})
```

## 测试策略

### 单元测试

**测试范围**：
- `lib/auth.ts`: 密码哈希、JWT 生成/验证
- `lib/csv-parser.ts`: CSV 解析逻辑
- `lib/ai.ts`: 重试逻辑、超时处理（mock API）
- `lib/validations/auth.ts`: Zod schema 验证

**示例**：
```typescript
// __test__/unit/lib/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth'

describe('auth', () => {
  describe('hashPassword & verifyPassword', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'test123456'
      const hashed = await hashPassword(password)
      expect(hashed).not.toBe(password)
      expect(await verifyPassword(password, hashed)).toBe(true)
      expect(await verifyPassword('wrong', hashed)).toBe(false)
    })
  })

  describe('JWT', () => {
    it('should sign and verify token', async () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = await signToken(payload)
      const verified = await verifyToken(token)
      expect(verified).toMatchObject(payload)
    })
  })
})
```

### 集成测试

**测试范围**：
- API 路由完整流程
- 数据库操作
- 认证中间件

**测试数据库配置**：
```typescript
// __test__/setup.ts
import { execSync } from 'child_process'
import { join } from 'path'

const testDbPath = join(process.cwd(), 'prisma', 'test.db')

beforeAll(async () => {
  process.env.DATABASE_URL = `file:${testDbPath}`
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
})

afterAll(async () => {
  // 清理测试数据库
})
```

**示例**：
```typescript
// __test__/integration/api/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'

describe('Auth API', () => {
  it('should register and login user', async () => {
    // 注册
    const registerReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: '123456' }),
    })
    const registerRes = await register(registerReq)
    expect(registerRes.status).toBe(200)

    // 登录
    const loginReq = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: '123456' }),
    })
    const loginRes = await login(loginReq)
    expect(loginRes.status).toBe(200)
  })
})
```

### E2E 测试

**测试范围**：
- 用户注册/登录流程
- CSV 上传
- Dashboard 数据展示
- AI 分析报告

**示例**：
```typescript
// __test__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should register and login', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[id="email"]', 'e2e@test.com')
    await page.fill('input[id="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
```

## WSL2 特殊配置

### 安装 Playwright 依赖

```bash
# 在 WSL2 中运行
npx playwright install-deps chromium
npx playwright install chromium
```

### Headless 模式

WSL2 完全支持 headless 模式，无需额外配置。

### Headed 模式（可选）

如需在 WSL2 中查看浏览器界面：

1. 安装 VcXsrv 或 WSLg（Windows 11 内置）
2. 设置 `DISPLAY` 环境变量：
   ```bash
   export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
   ```

## NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 依赖安装

```bash
# Vitest
npm install -D vitest @vitest/coverage-v8 jsdom

# Playwright
npm install -D @playwright/test

# 测试工具
npm install -D @testing-library/react @testing-library/jest-dom
```

## 测试优先级

1. **高优先级**：`lib/auth.ts`、`lib/validations/auth.ts`（安全相关）
2. **中优先级**：`lib/csv-parser.ts`、API 路由
3. **低优先级**：`lib/ai.ts`（依赖外部 API）、E2E 测试

## 注意事项

1. 测试文件统一放在 `__test__` 目录
2. 单元测试文件命名：`*.test.ts`
3. E2E 测试文件命名：`*.spec.ts`
4. 集成测试使用独立的测试数据库 `prisma/test.db`
5. Mock 外部 API（讯飞星火）避免真实调用
