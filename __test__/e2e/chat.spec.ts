import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  // Test user credentials created via registration
  let testUserEmail: string;
  const testUserPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-chat-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.locator('input#name').fill('Chat Test User');
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

  test.describe('Unauthenticated Access', () => {
    test('should show login prompt when clicking chat button without authentication', async ({ page }) => {
      await page.goto('/');

      // Wait for page to load
      await expect(page.locator('body')).toBeVisible();

      // Find and click the floating chat button
      const chatButton = page.locator('button:has([class*="lucide-message-circle"])');
      await expect(chatButton).toBeVisible({ timeout: 5000 });
      await chatButton.click();

      // Should show toast error message
      await expect(page.locator('text=请先登录')).toBeVisible({ timeout: 5000 });

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Authenticated Chat', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for loading to complete
      await expect(page.locator('text=加载中')).not.toBeVisible({ timeout: 10000 });
    });

    test('should display floating chat button', async ({ page }) => {
      // The floating chat button should be visible
      const chatButton = page.locator('button:has([class*="lucide-message-circle"])');
      await expect(chatButton).toBeVisible({ timeout: 5000 });

      // Should have fixed positioning (floating)
      await expect(chatButton).toHaveClass(/fixed/);
    });

    test('should open chat dialog when clicking floating button', async ({ page }) => {
      // Click the floating chat button
      const chatButton = page.locator('button:has([class*="lucide-message-circle"])');
      await chatButton.click();

      // Dialog should open with title (use role to avoid strict mode violation)
      await expect(page.getByRole('heading', { name: '睡眠专家 AI' })).toBeVisible({ timeout: 5000 });

      // Dialog should have "新对话" button in conversation list
      await expect(page.locator('button:has-text("新对话")')).toBeVisible({ timeout: 5000 });

      // Dialog should have input area
      await expect(page.locator('textarea[placeholder="输入你的问题..."]')).toBeVisible({ timeout: 5000 });
    });

    test('should close chat dialog when clicking close button', async ({ page }) => {
      // Wait for page to be stable
      await page.waitForLoadState('networkidle');

      // Open chat dialog
      const chatButton = page.locator('button:has([class*="lucide-message-circle"])');
      await chatButton.click();
      await expect(page.getByRole('heading', { name: '睡眠专家 AI' })).toBeVisible({ timeout: 5000 });

      // Close dialog by clicking the close button (button with X icon in top-right corner)
      const closeButton = page.locator('[data-slot="dialog-close"]');
      await closeButton.click();

      // Dialog should be closed
      await expect(page.getByRole('heading', { name: '睡眠专家 AI' })).not.toBeVisible({ timeout: 3000 });
    });
  });
});
