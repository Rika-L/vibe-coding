import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  // Test user credentials created via registration
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-settings-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Settings Test User');
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
      await page.goto('/settings');

      // Should be redirected to login with redirect parameter
      await expect(page).toHaveURL(/\/login\?redirect=\/settings/);
    });

    test('should access settings after login', async ({ page }) => {
      await login(page);

      // Navigate to settings
      await page.goto('/settings');

      // Should be on settings page
      expect(page.url()).toContain('/settings');

      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });

      // Should show settings header
      await expect(page.locator('text=用户设置')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Page Layout', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto('/settings');
      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display avatar and name section', async ({ page }) => {
      // Should show avatar and name card title (exact match to avoid matching the hint text)
      await expect(page.getByText('头像和名称', { exact: true })).toBeVisible();

      // Should show user name or placeholder
      await expect(page.locator('text=Settings Test User')).toBeVisible();

      // Should show edit button
      await expect(page.locator('button:has-text("编辑")')).toBeVisible();
    });

    test('should display account security section', async ({ page }) => {
      // Should show account security card title (exact match)
      await expect(page.getByText('账号安全', { exact: true })).toBeVisible();

      // Should show email field
      await expect(page.locator('text=邮箱')).toBeVisible();
      await expect(page.locator(`text=${testUserEmail}`)).toBeVisible();

      // Should show password label (more specific to avoid matching button)
      await expect(page.locator('p.text-muted-foreground:has-text("密码")')).toBeVisible();

      // Should show change password button
      await expect(page.locator('button:has-text("修改密码")')).toBeVisible();
    });

    test('should display account info section', async ({ page }) => {
      // Should show account info card
      await expect(page.locator('text=账号信息')).toBeVisible();

      // Should show registration date
      await expect(page.locator('text=注册时间')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back when clicking back button', async ({ page }) => {
      await login(page);

      // Navigate to settings from dashboard
      await page.goto('/settings');
      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });

      // Click back button (ArrowLeft icon button in header)
      await page.locator('header button').first().click();

      // Should navigate back to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });
  });
});
