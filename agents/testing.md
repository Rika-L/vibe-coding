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
├── setup.ts                 # 单元测试设置
├── setup.integration.ts     # 集成测试设置
├── unit/                    # 单元测试
│   ├── lib/
│   │   ├── auth.test.ts
│   │   ├── csv-parser.test.ts
│   │   └── ai.test.ts
│   └── validations/
│       └── auth.test.ts
├── integration/             # 集成测试
│   └── api/
│       ├── auth.test.ts
│       └── sleep-records.test.ts
└── e2e/                     # E2E 测试
    ├── auth.spec.ts
    └── dashboard.spec.ts
```

## 常用命令

```bash
npm run test              # 运行单元测试（watch 模式）
npm run test:run          # 运行单元测试（单次）
npm run test:coverage     # 生成覆盖率报告
npm run test:integration  # 运行集成测试
npm run test:e2e          # 运行 E2E 测试
npm run test:e2e:ui       # E2E 测试 UI 模式
```

## 测试原则

1. **TDD**: 先写测试，再写实现
2. **隔离**: 每个测试独立，不依赖其他测试
3. **清晰**: 测试名称描述清楚预期行为
4. **覆盖**: 测试正常路径和边界情况

## WSL2 注意事项

### E2E 测试

运行 E2E 测试前需要安装系统依赖：

```bash
sudo npx playwright install-deps chromium
```

如果不想使用 sudo，可以只安装浏览器：

```bash
npx playwright install chromium
```

但某些测试可能因缺少系统库而失败。

## 覆盖率目标

| 指标 | 目标 |
|------|------|
| 行覆盖率 | 60% |
| 函数覆盖率 | 65% |
| 分支覆盖率 | 35% |
| 语句覆盖率 | 60% |

## 编写测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })
})
```

### 集成测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/auth/register/route'

describe('Auth API', () => {
  it('should register a new user', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: '123456' })
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### E2E 测试示例

```typescript
import { test, expect } from '@playwright/test'

test('should login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input#email', 'test@example.com')
  await page.fill('input#password', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/)
})
```
