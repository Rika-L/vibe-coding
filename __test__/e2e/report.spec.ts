import { test, expect } from '@playwright/test';

test.describe('Report Page', () => {
  // Test user credentials created via registration
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-report-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Report Test User');
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

  test.describe('Report List (History Page - Reports Tab)', () => {
    test('should show empty state when no reports', async ({ page }) => {
      await login(page);

      // Navigate to history page
      await page.goto('/history');

      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });

      // Click on "AI 分析报告" tab
      await page.locator('button:has-text("AI 分析报告")').click();

      // Wait for reports to load
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 5000 });

      // Should show empty state for new user without reports
      await expect(page.locator('text=暂无分析报告')).toBeVisible({ timeout: 5000 });

      // Should show button to generate first report
      await expect(page.locator('button:has-text("生成第一份报告")')).toBeVisible();
    });

    test('should navigate to dashboard when clicking generate report button', async ({ page }) => {
      await login(page);

      // Navigate to history page reports tab
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
      await page.locator('button:has-text("AI 分析报告")').click();
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 5000 });

      // Check if empty state is shown
      const emptyState = page.locator('text=暂无分析报告');
      if (await emptyState.isVisible()) {
        // Click the generate first report button
        await page.locator('button:has-text("生成第一份报告")').click();

        // Should navigate to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
      }
    });

    test('should show reports tab with correct UI elements', async ({ page }) => {
      await login(page);

      // Navigate to history page
      await page.goto('/history');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });

      // Click on "AI 分析报告" tab
      await page.locator('button:has-text("AI 分析报告")').click();
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 5000 });

      // Should show the reports card title (use more specific selector to avoid matching button)
      await expect(page.locator('text=/AI 分析报告 \\(\\d+ 份\\)/')).toBeVisible();

      // Should show either empty state or reports list
      const emptyState = page.locator('text=暂无分析报告');
      const reportCards = page.locator('[class*="group"][class*="flex"]').filter({ has: page.locator('h3') });

      // One of them should be visible
      await expect(emptyState.or(reportCards.first())).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Report Detail Page', () => {
    test('should show 404 for non-existent report', async ({ page }) => {
      await login(page);

      // Navigate to a non-existent report
      await page.goto('/report/non-existent-report-id');

      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });

      // Should show not found state
      await expect(page.locator('text=报告不存在')).toBeVisible({ timeout: 5000 });

      // Should show message about report being deleted
      await expect(page.locator('text=该报告可能已被删除')).toBeVisible();

      // Should show button to return to dashboard
      await expect(page.locator('button:has-text("返回看板")')).toBeVisible();
    });

    test('should navigate back to dashboard from 404 page', async ({ page }) => {
      await login(page);

      // Navigate to a non-existent report
      await page.goto('/report/non-existent-report-id');
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=报告不存在')).toBeVisible({ timeout: 5000 });

      // Click return to dashboard button
      await page.locator('button:has-text("返回看板")').click();

      // Should navigate to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should show loading state initially', async ({ page }) => {
      await login(page);

      // Navigate to a report page
      await page.goto('/report/some-report-id');

      // Should show loading spinner initially
      await expect(page.locator('text=加载中')).toBeVisible({ timeout: 5000 });
    });

    test('should show error state on API failure', async ({ page }) => {
      await login(page);

      // Intercept API call and force error
      await page.route('**/api/reports/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // Navigate to a report page
      await page.goto('/report/some-report-id');

      // Wait for error state
      await expect(page.locator('text=加载失败')).toBeVisible({ timeout: 10000 });

      // Should show retry button
      await expect(page.locator('button:has-text("重新加载")')).toBeVisible();

      // Should show return to dashboard button
      await expect(page.locator('button:has-text("返回看板")')).toBeVisible();
    });

    test('should retry loading on retry button click', async ({ page }) => {
      await login(page);

      let shouldFail = true;

      // Intercept API call
      await page.route('**/api/reports/**', (route) => {
        if (shouldFail) {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
          });
        }
        else {
          // Return 404 on retry to test the flow
          route.fulfill({
            status: 404,
            body: JSON.stringify({ error: 'Not Found' }),
          });
        }
      });

      // Navigate to a report page
      await page.goto('/report/some-report-id');

      // Wait for error state
      await expect(page.locator('text=加载失败')).toBeVisible({ timeout: 10000 });

      // On retry, return 404
      shouldFail = false;

      // Click retry button
      await page.locator('button:has-text("重新加载")').click();

      // Should show not found state (since we return 404)
      await expect(page.locator('text=报告不存在')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Access Control', () => {
    test('should handle unauthenticated access appropriately', async ({ page }) => {
      // Navigate to a report page without logging in
      await page.goto('/report/some-report-id');

      // The page should either:
      // 1. Show error/not found state (if no auth required for page but API fails)
      // 2. Redirect to login (if auth required)
      // Either behavior is acceptable

      // Wait for page to settle (either redirect or content shown)
      await page.waitForTimeout(1000);

      // Check final state - either on login page or showing error/not found
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/login');

      if (!isOnLoginPage) {
        // If not redirected to login, should show error or not found
        const errorState = page.locator('text=/报告不存在|加载失败/');
        await expect(errorState).toBeVisible({ timeout: 10000 });
      }
      // If redirected to login, that's also acceptable
    });
  });
});
