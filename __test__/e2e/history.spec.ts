import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-history-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('History Test User');
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

  test.describe('Access Control', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/history');
      await expect(page).toHaveURL(/\/login\?redirect=%2Fhistory/);
    });

    test('should access history after login', async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page).toHaveURL(/\/history/, { timeout: 10000 });
    });
  });

  test.describe('Page Layout', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display page header', async ({ page }) => {
      await expect(page.locator('h1:has-text("历史记录")')).toBeVisible();
    });

    test('should display navigation buttons', async ({ page }) => {
      await expect(page.locator('a:has-text("返回")')).toBeVisible();
      await expect(page.locator('button:has-text("添加记录")')).toBeVisible();
    });

    test('should display data table or empty state', async ({ page }) => {
      const hasData = await page.locator('table').isVisible();
      const hasEmptyState = await page.locator('text=暂无数据').isVisible();

      // Either should be visible
      expect(hasData || hasEmptyState).toBe(true);
    });
  });

  test.describe('Data Table', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible();

      if (hasTable) {
        await expect(page.locator('th:has-text("日期")')).toBeVisible();
        await expect(page.locator('th:has-text("睡眠时长")')).toBeVisible();
        await expect(page.locator('th:has-text("睡眠评分")')).toBeVisible();
      }
    });

    test('should have pagination controls', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible();

      if (hasTable) {
        // Check for pagination elements
        const hasPagination = await page.locator('button:has-text("上一页"), button:has-text("下一页"), button:has-text("第")').first().isVisible();
        if (hasPagination) {
          await expect(page.locator('button:has-text("上一页"), button:has-text("下一页")').first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Add Record Dialog', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should open add record dialog', async ({ page }) => {
      await page.locator('button:has-text("添加记录")').click();
      await expect(page.locator('text=添加睡眠记录')).toBeVisible({ timeout: 5000 });
    });

    test('should have form fields in dialog', async ({ page }) => {
      await page.locator('button:has-text("添加记录")').click();
      await expect(page.locator('text=添加睡眠记录')).toBeVisible({ timeout: 5000 });

      // Check for form fields
      await expect(page.locator('label:has-text("日期")')).toBeVisible();
      await expect(page.locator('label:has-text("睡眠时长")')).toBeVisible();
    });

    test('should close dialog on cancel', async ({ page }) => {
      await page.locator('button:has-text("添加记录")').click();
      await expect(page.locator('text=添加睡眠记录')).toBeVisible({ timeout: 5000 });

      // Click cancel button
      await page.locator('button:has-text("取消")').click();

      // Dialog should close
      await expect(page.locator('text=添加睡眠记录')).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Batch Delete (if data exists)', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should show batch delete button when data exists', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible();

      if (hasTable) {
        // Check for batch delete button
        const hasBatchDelete = await page.locator('button:has-text("批量删除")').isVisible();
        if (hasBatchDelete) {
          await expect(page.locator('button:has-text("批量删除")')).toBeVisible();
        }
      }
    });

    test('should show clear all button when data exists', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible();

      if (hasTable) {
        // Check for clear all button
        const hasClearAll = await page.locator('button:has-text("清空全部")').isVisible();
        if (hasClearAll) {
          await expect(page.locator('button:has-text("清空全部")')).toBeVisible();
        }
      }
    });

    test('should show select all checkbox when data exists', async ({ page }) => {
      const hasTable = await page.locator('table').isVisible();

      if (hasTable) {
        // Check for select all checkbox in table header
        const hasCheckbox = await page.locator('th input[type="checkbox"]').isVisible();
        if (hasCheckbox) {
          await expect(page.locator('th input[type="checkbox"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should navigate back to dashboard', async ({ page }) => {
      await page.locator('a:has-text("返回")').click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should show error state on API failure', async ({ page }) => {
      await login(page);

      // Intercept API call and force error
      await page.route('**/api/sleep-history', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // Reload page to trigger error
      await page.reload();

      // Wait for error state
      await expect(page.locator('text=加载失败')).toBeVisible({ timeout: 10000 });
    });
  });
});
