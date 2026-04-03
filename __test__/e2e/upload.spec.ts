import { test, expect } from '@playwright/test';

test.describe('Home Page Upload Flow', () => {
  // Test user credentials created via registration
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-upload-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Upload Test User');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    // Wait for registration to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await context.close();
  });

  // Helper function to login before each test
  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input#email').fill(testUserEmail);
    await page.locator('input#password').fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe('Unauthenticated User', () => {
    test('should show login button when not authenticated', async ({ page }) => {
      await page.goto('/');

      // Should show login button in header
      await expect(page.locator('button:has-text("登录")')).toBeVisible();
    });

    test('should show upload area', async ({ page }) => {
      await page.goto('/');

      // Should show upload card with drag and drop area
      await expect(page.locator('text=拖拽 CSV 文件到这里')).toBeVisible();
      await expect(page.locator('button:has-text("选择文件")')).toBeVisible();
    });

    test('should show feature cards', async ({ page }) => {
      await page.goto('/');

      // Should show three feature cards (use heading role to avoid hero section text match)
      await expect(page.getByRole('heading', { name: 'AI 智能分析' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '可视化图表' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '改善建议' })).toBeVisible();
    });

    test('should show login prompt when clicking manual add', async ({ page }) => {
      await page.goto('/');

      // Click manual add button
      await page.locator('button:has-text("手动添加记录")').click();

      // Should show login error toast
      await expect(page.locator('text=请先登录')).toBeVisible({ timeout: 5000 });

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/');
    });

    test('should show dashboard button when authenticated', async ({ page }) => {
      // Should show dashboard button in header
      await expect(page.locator('button:has-text("看板")')).toBeVisible();
    });

    test('should show upload area for authenticated user', async ({ page }) => {
      // Should show upload card
      await expect(page.locator('text=拖拽 CSV 文件到这里')).toBeVisible();
      await expect(page.locator('button:has-text("选择文件")')).toBeVisible();
    });

    test('should show feature cards for authenticated user', async ({ page }) => {
      // Should show three feature cards (use heading role to avoid hero section text match)
      await expect(page.getByRole('heading', { name: 'AI 智能分析' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '可视化图表' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '改善建议' })).toBeVisible();
    });

    test('should open manual add dialog when clicking manual add', async ({ page }) => {
      // Click manual add button
      await page.locator('button:has-text("手动添加记录")').click();

      // Should open the sleep record dialog
      await expect(page.locator('text=添加睡眠记录')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Theme Toggle', () => {
    test('should have theme toggle button on home page', async ({ page }) => {
      await page.goto('/');

      // Theme toggle should be visible
      const themeToggle = page.locator('button[aria-label="切换主题"]');
      await expect(themeToggle).toBeVisible();
    });
  });
});
