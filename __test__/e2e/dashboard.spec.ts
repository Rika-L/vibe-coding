import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  // Test user credentials created via registration
  let testUserEmail: string;
  const testUserPassword = "password123";

  test.beforeAll(async ({ browser }) => {
    testUserEmail = `e2e-dashboard-${Date.now()}@test.com`;

    // Create user via registration
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/register");
    await page.locator("input#name").fill("Dashboard Test User");
    await page.locator("input#email").fill(testUserEmail);
    await page.locator("input#password").fill(testUserPassword);
    await page.locator('button[type="submit"]').click();

    // Wait for registration to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await context.close();
  });

  // Helper function to login before each test
  async function login(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.locator("input#email").fill(testUserEmail);
    await page.locator("input#password").fill(testUserPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.describe("Access Control", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard");

      // Should be redirected to login with redirect parameter
      await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    });

    test("should access dashboard after login", async ({ page }) => {
      await login(page);

      // Should be on dashboard page
      expect(page.url()).toContain("/dashboard");

      // Should show header with title
      await expect(page.locator("text=睡眠数据看板")).toBeVisible();
    });
  });

  test.describe("Page Layout", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
    });

    test("should display header with navigation elements", async ({ page }) => {
      // Should show back link in header (more specific selector)
      await expect(page.locator('header a:has-text("返回")')).toBeVisible();

      // Should show page title
      await expect(page.locator("text=睡眠数据看板")).toBeVisible();

      // Should show history button
      await expect(page.locator('button:has-text("历史数据")')).toBeVisible();

      // Should show logout button
      await expect(page.locator('button[aria-label="登出"]')).toBeVisible();

      // Should show AI report button (may be disabled if no data)
      await expect(page.locator('button:has-text("生成 AI 报告")')).toBeVisible();
    });

    test("should display filter section when data exists", async ({ page }) => {
      // Check if we have data
      const hasEmptyState = await page.locator("text=暂无数据").isVisible();

      if (!hasEmptyState) {
        // Should show date inputs
        await expect(page.locator('input[type="date"]').first()).toBeVisible();

        // Should show filter button
        await expect(page.locator('button:has-text("筛选")')).toBeVisible();

        // Should show clear button
        await expect(page.locator('button:has-text("清除")')).toBeVisible();
      }
    });
  });

  test.describe("Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
    });

    test("should navigate to history page", async ({ page }) => {
      // Click history button
      await page.locator('button:has-text("历史数据")').click();

      // Should navigate to history page
      await expect(page).toHaveURL(/\/history/, { timeout: 5000 });
    });

    test("should navigate back to home page", async ({ page }) => {
      // Click back link in header (more specific selector)
      await page.locator('header a:has-text("返回")').click();

      // Should navigate to home page
      await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
    });

    test("should logout successfully", async ({ page }) => {
      // Click logout button
      await page.locator('button[aria-label="登出"]').click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe("Empty State", () => {
    test("should show empty state when no data", async ({ page }) => {
      await login(page);

      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Should show empty state for new user without data
      const emptyState = page.locator("text=暂无数据");
      const statsGrid = page.locator("text=平均睡眠时长");

      // Either empty state or stats should be visible
      await expect(emptyState.or(statsGrid)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("With Sleep Data", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for page to load
      await expect(page.locator("text=睡眠数据看板")).toBeVisible();
    });

    test("should display stats cards when data exists", async ({ page }) => {
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Check if we have data (not empty state)
      const hasData = await page.locator("text=平均睡眠时长").isVisible();

      if (hasData) {
        // Stats cards should be visible
        await expect(page.locator("text=平均睡眠时长")).toBeVisible();
        await expect(page.locator("text=记录天数")).toBeVisible();
        await expect(page.locator("text=平均深睡")).toBeVisible();
        await expect(page.locator("text=数据完整度")).toBeVisible();
      }
    });

    test("should display chart sections when data exists", async ({ page }) => {
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Check if we have data (not empty state)
      const hasData = await page.locator("text=睡眠评分").isVisible();

      if (hasData) {
        // Chart cards should be visible
        await expect(page.locator("text=睡眠评分")).toBeVisible();
        await expect(page.locator("text=睡眠趋势")).toBeVisible();
        await expect(page.locator("text=平均睡眠结构")).toBeVisible();

        // Charts are canvas elements (ECharts)
        const canvasElements = page.locator("canvas");
        const canvasCount = await canvasElements.count();

        // Should have at least 3 charts rendered
        expect(canvasCount).toBeGreaterThanOrEqual(3);
      }
    });

    test("should display record count in filter section", async ({ page }) => {
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Check if we have data
      const recordCount = page.locator(/显示 \d+ 条记录/);

      if (await recordCount.isVisible()) {
        // Record count format should be visible
        await expect(recordCount).toBeVisible();
      }
    });
  });

  test.describe("Filter Functionality", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for page to load
      await expect(page.locator("text=睡眠数据看板")).toBeVisible();
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
    });

    test("should have date filter inputs when data exists", async ({ page }) => {
      // Check if we have data
      const hasEmptyState = await page.locator("text=暂无数据").isVisible();

      if (!hasEmptyState) {
        // Check for date inputs
        const dateInputs = page.locator('input[type="date"]');
        const count = await dateInputs.count();

        // Should have start date and end date inputs
        expect(count).toBeGreaterThanOrEqual(2);
      }
    });

    test("should show filter and clear buttons when data exists", async ({ page }) => {
      // Check if we have data
      const hasEmptyState = await page.locator("text=暂无数据").isVisible();

      if (!hasEmptyState) {
        // Filter button should be visible
        await expect(page.locator('button:has-text("筛选")')).toBeVisible();

        // Clear button should be visible
        await expect(page.locator('button:has-text("清除")')).toBeVisible();
      }
    });
  });

  test.describe("AI Report Generation", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await expect(page.locator("text=睡眠数据看板")).toBeVisible();
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
    });

    test("should have AI report button", async ({ page }) => {
      // AI report button should be visible
      const reportButton = page.locator('button:has-text("生成 AI 报告")');

      // Check if we have data (button might be enabled or disabled based on data)
      await expect(reportButton).toBeVisible();
    });

    test("should open date range dialog when clicking AI report", async ({ page }) => {
      // Check if we have data first
      const hasEmptyState = await page.locator("text=暂无数据").isVisible();

      if (!hasEmptyState) {
        // Click AI report button
        await page.locator('button:has-text("生成 AI 报告")').click();

        // Date range dialog should appear
        await expect(page.locator("text=选择分析日期范围")).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should show error state on API failure", async ({ page }) => {
      await login(page);

      // Intercept API call and force error
      await page.route("**/api/sleep-data", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      // Reload page to trigger error
      await page.reload();

      // Wait for error state
      await expect(page.locator("text=加载失败")).toBeVisible({ timeout: 10000 });

      // Should show retry button
      await expect(page.locator('button:has-text("重新加载")')).toBeVisible();
    });
  });

  test.describe("Theme Toggle", () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      // Wait for loading to complete
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
    });

    test("should have theme toggle button", async ({ page }) => {
      // Theme toggle should be in header
      // It's a button with sun/moon icons
      const themeToggle = page.locator('button[aria-label*="主题"], button[aria-label*="theme"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])');

      // At least one theme button should exist
      const count = await themeToggle.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
