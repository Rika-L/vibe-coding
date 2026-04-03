# 测试覆盖率提升实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 分三阶段补全测试覆盖：E2E 测试、API 集成测试、组件单元测试

**Architecture:** 复用现有测试框架和配置，按阶段递增测试覆盖

**Tech Stack:** Playwright (E2E), Vitest + Testing Library (单元/集成)

---

## 阶段 1: E2E 测试

### Task 1: 首页上传流程 E2E 测试

**Files:**
- Create: `__test__/e2e/upload.spec.ts`

- [ ] **Step 1: 创建 upload.spec.ts 测试文件**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Upload Flow', () => {
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-upload-${Date.now()}@test.com`;

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Upload Test User');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await context.close();
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe('Unauthenticated Upload', () => {
    test('should show login prompt when uploading without login', async ({ page }) => {
      await page.goto('/');

      // Try to upload without login - click "手动添加记录" which requires auth
      await page.locator('text=手动添加记录').click();

      // Should show error toast and redirect to login
      await expect(page.locator('text=请先登录')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Authenticated Upload', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/');
    });

    test('should display upload area', async ({ page }) => {
      await expect(page.locator('text=拖拽 CSV 文件到这里')).toBeVisible();
      await expect(page.locator('button:has-text("选择文件")')).toBeVisible();
    });

    test('should show feature cards', async ({ page }) => {
      await expect(page.locator('text=AI 智能分析')).toBeVisible();
      await expect(page.locator('text=可视化图表')).toBeVisible();
      await expect(page.locator('text=改善建议')).toBeVisible();
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npm run test:e2e -- --grep "Upload Flow"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/e2e/upload.spec.ts
git commit -m "test(e2e): add upload flow tests"
```

### Task 2: 设置页面 E2E 测试

**Files:**
- Create: `__test__/e2e/settings.spec.ts`

- [ ] **Step 1: 创建 settings.spec.ts 测试文件**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-settings-${Date.now()}@test.com`;

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Settings Test User');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await context.close();
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe('Access Control', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login\?redirect=%2Fsettings/);
    });

    test('should access settings after login', async ({ page }) => {
      await login(page);
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/settings/);
      await expect(page.locator('text=用户设置')).toBeVisible();
    });
  });

  test.describe('Page Layout', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/settings');
    });

    test('should display profile section', async ({ page }) => {
      await expect(page.locator('text=头像和名称')).toBeVisible();
      await expect(page.locator('button:has-text("编辑")')).toBeVisible();
    });

    test('should display security section', async ({ page }) => {
      await expect(page.locator('text=账号安全')).toBeVisible();
      await expect(page.locator('button:has-text("修改密码")')).toBeVisible();
    });

    test('should display account info section', async ({ page }) => {
      await expect(page.locator('text=账号信息')).toBeVisible();
      await expect(page.locator('text=注册时间')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/settings');
    });

    test('should navigate back', async ({ page }) => {
      await page.locator('button').filter({ hasText: '返回' }).or(page.locator('button[aria-label="返回"]')).click();
      // Should navigate back
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npm run test:e2e -- --grep "Settings Page"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/e2e/settings.spec.ts
git commit -m "test(e2e): add settings page tests"
```

### Task 3: 报告页面 E2E 测试

**Files:**
- Create: `__test__/e2e/report.spec.ts`

- [ ] **Step 1: 创建 report.spec.ts 测试文件**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Report Page', () => {
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-report-${Date.now()}@test.com`;

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Report Test User');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await context.close();
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe('Report List', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('should show empty state when no reports', async ({ page }) => {
      // Navigate to a page that shows reports list
      // Reports are typically accessed from dashboard
      await page.goto('/dashboard');

      // Check if we're on dashboard
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Report Detail', () => {
    test('should show 404 for non-existent report', async ({ page }) => {
      await page.goto('/report/non-existent-id');
      // Should show error or redirect
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npm run test:e2e -- --grep "Report Page"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/e2e/report.spec.ts
git commit -m "test(e2e): add report page tests"
```

### Task 4: AI 聊天 E2E 测试

**Files:**
- Create: `__test__/e2e/chat.spec.ts`

- [ ] **Step 1: 创建 chat.spec.ts 测试文件**

```typescript
import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-chat-${Date.now()}@test.com`;

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Chat Test User');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await context.close();
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe('Unauthenticated Access', () => {
    test('should prompt login when clicking chat without auth', async ({ page }) => {
      await page.goto('/');

      // Look for chat button (floating button)
      const chatButton = page.locator('[data-testid="chat-floating-button"]').or(
        page.locator('button').filter({ hasText: '聊天' })
      );

      if (await chatButton.isVisible()) {
        await chatButton.click();
        // Should show login prompt
      }
    });
  });

  test.describe('Authenticated Chat', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should have chat floating button', async ({ page }) => {
      // Look for floating chat button
      const chatButton = page.locator('[data-testid="chat-floating-button"]').or(
        page.locator('button[class*="fixed"]')
      );

      // Chat button should be visible somewhere on the page
    });

    test('should open chat dialog on click', async ({ page }) => {
      // Look for and click chat button
      const chatButton = page.locator('[data-testid="chat-floating-button"]').or(
        page.locator('button').filter({ hasText: /聊天|AI/ })
      );

      if (await chatButton.isVisible()) {
        await chatButton.click();
        // Dialog should open
      }
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npm run test:e2e -- --grep "AI Chat"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/e2e/chat.spec.ts
git commit -m "test(e2e): add AI chat tests"
```

---

## 阶段 2: API 集成测试

### Task 5: Upload API 集成测试

**Files:**
- Create: `__test__/integration/api/upload.test.ts`

- [ ] **Step 1: 创建 upload.test.ts 测试文件**

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

const testPrisma = new PrismaClient();

vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

const testJwtSecret = 'test-jwt-secret-key-for-testing';
const testKey = new TextEncoder().encode(testJwtSecret);

async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey);
}

let testUserId: string;
let testToken: string;

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

const { POST: uploadHandler } = await import('@/app/api/upload/route');

function createUploadRequest(file: File | null, filename: string = 'test.csv'): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  return new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });
}

function createCSVFile(content: string, filename: string = 'test.csv'): File {
  return new File([content], filename, { type: 'text/csv' });
}

describe('Upload API', () => {
  beforeAll(async () => {
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: `upload-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Upload Test User',
      },
    });
    testUserId = user.id;
    testToken = await generateTestToken(user.id, user.email);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/upload', () => {
    it('should reject unauthenticated requests', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: null });

      const csvContent = 'date,bedTime,wakeTime,sleepDuration\n2024-01-01,22:00,06:00,8';
      const file = createCSVFile(csvContent);
      const request = createUploadRequest(file);

      const response = await uploadHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should reject non-CSV files', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const request = createUploadRequest(file, 'test.txt');

      const response = await uploadHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('CSV');
    });

    it('should reject missing file', async () => {
      const request = createUploadRequest(null);

      const response = await uploadHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should upload valid CSV successfully', async () => {
      const csvContent = `date,bedTime,wakeTime,sleepDuration,deepSleep,lightSleep,remSleep,sleepScore
2024-01-01,22:00,06:00,8,2,4,1.5,85
2024-01-02,23:00,07:00,8,1.5,4.5,1,80`;
      const file = createCSVFile(csvContent);
      const request = createUploadRequest(file);

      const response = await uploadHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.integration.ts __test__/integration/api/upload.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/integration/api/upload.test.ts
git commit -m "test(api): add upload API integration tests"
```

### Task 6: User API 集成测试

**Files:**
- Create: `__test__/integration/api/user.test.ts`

- [ ] **Step 1: 创建 user.test.ts 测试文件**

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

const testPrisma = new PrismaClient();

vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

const testJwtSecret = 'test-jwt-secret-key-for-testing';
const testKey = new TextEncoder().encode(testJwtSecret);

async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey);
}

let testUserId: string;
let testUserEmail: string;
let testToken: string;

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

const { GET: getProfile, PUT: updateProfile } = await import('@/app/api/user/profile/route');
const { PUT: changePassword } = await import('@/app/api/user/password/route');

function createJSONRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('User API', () => {
  beforeAll(async () => {
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: `user-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'User Test',
      },
    });
    testUserId = user.id;
    testUserEmail = user.email;
    testToken = await generateTestToken(user.id, user.email);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user/profile', () => {
    it('should reject unauthenticated requests', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: null });

      const response = await getProfile();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should return user profile', async () => {
      const response = await getProfile();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testUserEmail);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user name', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/profile', {
        name: 'Updated Name',
      });

      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe('Updated Name');
    });

    it('should update user avatar', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/profile', {
        avatar: '😊',
      });

      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.avatar).toBe('😊');
    });

    it('should reject name longer than 50 characters', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/profile', {
        name: 'a'.repeat(51),
      });

      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('名称过长');
    });
  });

  describe('PUT /api/user/password', () => {
    it('should change password with correct current password', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/password', {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });

      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject wrong current password', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/password', {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      });

      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('当前密码错误');
    });

    it('should reject short new password', async () => {
      const request = createJSONRequest('http://localhost:3000/api/user/password', {
        currentPassword: 'newpassword123',
        newPassword: '12345',
      });

      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('密码至少6位');
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.integration.ts __test__/integration/api/user.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/integration/api/user.test.ts
git commit -m "test(api): add user API integration tests"
```

### Task 7: Conversations API 集成测试

**Files:**
- Create: `__test__/integration/api/conversations.test.ts`

- [ ] **Step 1: 创建 conversations.test.ts 测试文件**

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

const testPrisma = new PrismaClient();

vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

const testJwtSecret = 'test-jwt-secret-key-for-testing';
const testKey = new TextEncoder().encode(testJwtSecret);

async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey);
}

let testUserId: string;
let testToken: string;
let conversationId: string;

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

const { GET: getConversations, POST: createConversation } = await import('@/app/api/conversations/route');
const { GET: getConversation, DELETE: deleteConversation } = await import('@/app/api/conversations/[id]/route');

function createJSONRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Mock params for dynamic routes
function mockParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Conversations API', () => {
  beforeAll(async () => {
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: `conv-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Conv Test User',
      },
    });
    testUserId = user.id;
    testToken = await generateTestToken(user.id, user.email);

    // Create a test conversation
    const conv = await testPrisma.conversation.create({
      data: {
        title: 'Test Conversation',
        userId: testUserId,
      },
    });
    conversationId = conv.id;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/conversations', () => {
    it('should reject unauthenticated requests', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: null });

      const response = await getConversations();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should return conversations list', async () => {
      const response = await getConversations();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversations).toBeDefined();
      expect(Array.isArray(data.conversations)).toBe(true);
    });
  });

  describe('POST /api/conversations', () => {
    it('should create a new conversation', async () => {
      const request = createJSONRequest('http://localhost:3000/api/conversations', {
        title: 'New Chat',
      });

      const response = await createConversation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation).toBeDefined();
      expect(data.conversation.title).toBe('New Chat');
    });

    it('should create conversation with default title', async () => {
      const request = createJSONRequest('http://localhost:3000/api/conversations', {});

      const response = await createConversation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.title).toBe('新对话');
    });
  });

  describe('GET /api/conversations/[id]', () => {
    it('should return conversation details', async () => {
      const response = await getConversation(new Request('http://localhost:3000'), mockParams(conversationId));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation).toBeDefined();
      expect(data.conversation.id).toBe(conversationId);
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await getConversation(new Request('http://localhost:3000'), mockParams('non-existent-id'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('对话不存在');
    });
  });

  describe('DELETE /api/conversations/[id]', () => {
    it('should delete conversation', async () => {
      // Create a conversation to delete
      const conv = await testPrisma.conversation.create({
        data: { title: 'To Delete', userId: testUserId },
      });

      const response = await deleteConversation(new Request('http://localhost:3000'), mockParams(conv.id));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.integration.ts __test__/integration/api/conversations.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/integration/api/conversations.test.ts
git commit -m "test(api): add conversations API integration tests"
```

### Task 8: Reports API 集成测试

**Files:**
- Create: `__test__/integration/api/reports.test.ts`

- [ ] **Step 1: 创建 reports.test.ts 测试文件**

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

process.env.DATABASE_URL = `file:${process.cwd()}/prisma/test.db`;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

const testPrisma = new PrismaClient();

vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

const testJwtSecret = 'test-jwt-secret-key-for-testing';
const testKey = new TextEncoder().encode(testJwtSecret);

async function generateTestToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testKey);
}

let testUserId: string;
let testToken: string;
let reportId: string;

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn((name: string) => {
    if (name === 'auth-token' && testToken) {
      return { value: testToken };
    }
    return { value: null };
  }),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

const { GET: getReports } = await import('@/app/api/reports/route');
const { GET: getReport, DELETE: deleteReport } = await import('@/app/api/reports/[id]/route');

function mockParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Reports API', () => {
  beforeAll(async () => {
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword('password123');
    const user = await testPrisma.user.create({
      data: {
        email: `report-test-${Date.now()}@test.com`,
        password: hashedPassword,
        name: 'Report Test User',
      },
    });
    testUserId = user.id;
    testToken = await generateTestToken(user.id, user.email);

    // Create a test report
    const report = await testPrisma.analysisReport.create({
      data: {
        title: 'Test Report',
        summary: 'Test summary',
        suggestions: 'Test suggestions',
        sleepQuality: '良好',
        dataRange: '2024-01-01 至 2024-01-07',
        userId: testUserId,
      },
    });
    reportId = report.id;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('should reject unauthenticated requests', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: null });

      const response = await getReports(new Request('http://localhost:3000/api/reports'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should return reports list with pagination', async () => {
      const response = await getReports(new Request('http://localhost:3000/api/reports'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(Array.isArray(data.reports)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await getReports(new Request('http://localhost:3000/api/reports?page=1&pageSize=5'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.pageSize).toBe(5);
    });
  });

  describe('GET /api/reports/[id]', () => {
    it('should return report details', async () => {
      const response = await getReport(new Request('http://localhost:3000'), mockParams(reportId));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.report).toBeDefined();
      expect(data.report.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await getReport(new Request('http://localhost:3000'), mockParams('non-existent-id'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });
  });

  describe('DELETE /api/reports/[id]', () => {
    it('should reject unauthenticated requests', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: null });

      const response = await deleteReport(new Request('http://localhost:3000'), mockParams(reportId));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未登录');
    });

    it('should delete own report', async () => {
      // Create a report to delete
      const report = await testPrisma.analysisReport.create({
        data: {
          title: 'To Delete',
          summary: 'Summary',
          suggestions: 'Suggestions',
          sleepQuality: '良好',
          dataRange: '2024-01-01 至 2024-01-07',
          userId: testUserId,
        },
      });

      const response = await deleteReport(new Request('http://localhost:3000'), mockParams(report.id));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('删除成功');
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.integration.ts __test__/integration/api/reports.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/integration/api/reports.test.ts
git commit -m "test(api): add reports API integration tests"
```

---

## 阶段 3: 组件单元测试

### Task 9: 图表组件单元测试

**Files:**
- Create: `__test__/unit/components/charts.test.tsx`

- [ ] **Step 1: 创建 charts.test.tsx 测试文件**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SleepScoreGauge } from '@/components/charts/SleepScoreGauge';
import { SleepTrendChart } from '@/components/charts/SleepTrendChart';
import { SleepStructureChart } from '@/components/charts/SleepStructureChart';

// Mock ECharts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => <div data-testid="mock-chart" />),
}));

describe('Chart Components', () => {
  describe('SleepScoreGauge', () => {
    it('should render with score', () => {
      render(<SleepScoreGauge score={85} />);

      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });

    it('should handle null score', () => {
      render(<SleepScoreGauge score={null} />);

      // Should show empty state or placeholder
    });
  });

  describe('SleepTrendChart', () => {
    it('should render with data', () => {
      const data = [
        { date: '2024-01-01', duration: 8 },
        { date: '2024-01-02', duration: 7.5 },
      ];

      render(<SleepTrendChart data={data} />);

      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
      render(<SleepTrendChart data={[]} />);

      // Should show empty state
    });
  });

  describe('SleepStructureChart', () => {
    it('should render with data', () => {
      const data = {
        deep: 2,
        light: 4,
        rem: 1.5,
      };

      render(<SleepStructureChart data={data} />);

      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.components.ts __test__/unit/components/charts.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/unit/components/charts.test.tsx
git commit -m "test(components): add chart component tests"
```

### Task 10: 设置表单组件单元测试

**Files:**
- Create: `__test__/unit/components/settings.test.tsx`

- [ ] **Step 1: 创建 settings.test.tsx 测试文件**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';

// Mock fetch
global.fetch = vi.fn();

describe('Settings Components', () => {
  describe('ProfileForm', () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: '👤',
      createdAt: '2024-01-01',
    };

    it('should render form with user data', () => {
      render(
        <ProfileForm
          open={true}
          onOpenChange={() => {}}
          user={mockUser}
          onSuccess={() => {}}
        />
      );

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('should call onSuccess on successful submit', async () => {
      const mockOnSuccess = vi.fn();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { ...mockUser, name: 'Updated' } }),
      });

      render(
        <ProfileForm
          open={true}
          onOpenChange={() => {}}
          user={mockUser}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByDisplayValue('Test User');
      fireEvent.change(input, { target: { value: 'Updated Name' } });

      const submitButton = screen.getByText('保存');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('PasswordForm', () => {
    it('should render password form', () => {
      render(
        <PasswordForm
          open={true}
          onOpenChange={() => {}}
          onSuccess={() => {}}
        />
      );

      expect(screen.getByLabelText(/当前密码/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/新密码/i)).toBeInTheDocument();
    });

    it('should validate password length', async () => {
      render(
        <PasswordForm
          open={true}
          onOpenChange={() => {}}
          onSuccess={() => {}}
        />
      );

      const newPassInput = screen.getByLabelText(/新密码/i);
      fireEvent.change(newPassInput, { target: { value: '12345' } });

      const submitButton = screen.getByText('确认修改');
      fireEvent.click(submitButton);

      // Should show validation error
    });
  });
});
```

- [ ] **Step 2: 运行测试验证**

Run: `npx vitest run -c vitest.config.components.ts __test__/unit/components/settings.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add __test__/unit/components/settings.test.tsx
git commit -m "test(components): add settings form component tests"
```

---

## 最终步骤

### Task 11: 运行全量测试并提交

- [ ] **Step 1: 运行所有 E2E 测试**

Run: `npm run test:e2e`
Expected: All tests pass

- [ ] **Step 2: 运行所有集成测试**

Run: `npm run test:integration`
Expected: All tests pass

- [ ] **Step 3: 运行所有单元测试**

Run: `npm run test:run`
Expected: All tests pass

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "test: complete test coverage improvement

- Add E2E tests for upload, settings, report, chat pages
- Add API integration tests for upload, user, conversations, reports
- Add component unit tests for charts and settings forms"
```
