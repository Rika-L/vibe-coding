import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe("Registration", () => {
    test("should register a new user successfully", async ({ page }) => {
      const uniqueEmail = `e2e-${Date.now()}@test.com`;

      await page.goto("/register");

      // Fill in the registration form
      await page.locator("input#name").fill("Test User");
      await page.locator("input#email").fill(uniqueEmail);
      await page.locator("input#password").fill("password123");

      // Submit the form
      await page.locator("button").filter({ hasText: "注册" }).click();

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/register");

      // Fill in with invalid email
      await page.locator("input#name").fill("Test User");
      await page.locator("input#email").fill("invalid-email");
      await page.locator("input#password").fill("password123");

      // Trigger form submit via JavaScript
      await page.evaluate(() => {
        const form = document.querySelector("form");
        if (form) {
          // Create and dispatch a submit event
          const submitEvent = new SubmitEvent("submit", {
            bubbles: true,
            cancelable: true,
            submitter: form.querySelector('button[type="submit"]'),
          });
          form.dispatchEvent(submitEvent);
        }
      });

      // Should show validation error
      await expect(page.locator("text=请输入有效的邮箱地址")).toBeVisible();
    });

    test("should show validation error for short password", async ({ page }) => {
      await page.goto("/register");

      // Fill in with short password
      await page.locator("input#name").fill("Test User");
      await page.locator("input#email").fill("test@example.com");
      await page.locator("input#password").fill("123");

      // Click the submit button
      await page.locator("button").filter({ hasText: "注册" }).click();

      // Should show validation error
      await expect(page.locator("text=密码至少 6 个字符")).toBeVisible();
    });

    test("should navigate to login page", async ({ page }) => {
      await page.goto("/register");

      // Click the login link
      await page.locator('a[href="/login"]').click();

      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Login", () => {
    // Create a user first for login tests
    let testUserEmail: string;
    const testUserPassword = "password123";

    test.beforeAll(async ({ browser }) => {
      testUserEmail = `e2e-login-${Date.now()}@test.com`;

      // Create user via registration
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto("/register");
      await page.locator("input#name").fill("Login Test User");
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);
      await page.locator("button").filter({ hasText: "注册" }).click();

      // Wait for registration to complete
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      await context.close();
    });

    test("should login successfully with valid credentials", async ({ page }) => {
      await page.goto("/login");

      // Fill in the login form
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);

      // Submit the form
      await page.locator("button").filter({ hasText: "登录" }).click();

      // Should redirect to dashboard after successful login
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      // Fill in with wrong credentials
      await page.locator("input#email").fill("nonexistent@test.com");
      await page.locator("input#password").fill("wrongpassword");

      // Submit the form
      await page.locator("button").filter({ hasText: "登录" }).click();

      // Should show error toast or message
      await expect(
        page.locator("text=/邮箱或密码错误|登录失败/")
      ).toBeVisible({ timeout: 5000 });
    });

    test("should show validation error for empty fields", async ({ page }) => {
      await page.goto("/login");

      // Wait for the form to be rendered (LoginForm is inside Suspense)
      await page.waitForSelector('button[type="submit"]');

      // Click the submit button
      await page.locator('button[type="submit"]').click();

      // Should show validation errors (email validation shows "请输入有效的邮箱地址" due to zod order)
      await expect(page.locator("text=请输入有效的邮箱地址")).toBeVisible();
      await expect(page.locator("text=请输入密码")).toBeVisible();
    });

    test("should navigate to register page", async ({ page }) => {
      await page.goto("/login");

      // Click the register link
      await page.locator('a[href="/register"]').click();

      // Should navigate to register page
      await expect(page).toHaveURL(/\/register/);
    });

    test("should redirect to requested page after login", async ({ page }) => {
      // Try to access protected page
      await page.goto("/dashboard");

      // Should be redirected to login with redirect parameter
      await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);

      // Login
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);
      await page.locator("button").filter({ hasText: "登录" }).click();

      // Should redirect back to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  test.describe("Logout", () => {
    let testUserEmail: string;
    const testUserPassword = "password123";

    test.beforeAll(async ({ browser }) => {
      testUserEmail = `e2e-logout-${Date.now()}@test.com`;

      // Create user via registration
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto("/register");
      await page.locator("input#name").fill("Logout Test User");
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);
      await page.locator("button").filter({ hasText: "注册" }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      await context.close();
    });

    test("should logout successfully", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);
      await page.locator("button").filter({ hasText: "登录" }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Wait for page to load (loading state should complete)
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Check if we have data - header is only shown when there's data
      const hasData = await page.locator("text=睡眠数据看板").isVisible();
      if (!hasData) {
        // Navigate to history page which always has logout button
        await page.goto("/history");
        await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
      }

      // Click logout button
      await page.locator('button[aria-label="登出"]').click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test("should not access protected pages after logout", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.locator("input#email").fill(testUserEmail);
      await page.locator("input#password").fill(testUserPassword);
      await page.locator("button").filter({ hasText: "登录" }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Wait for page to load
      await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });

      // Check if we have data - header is only shown when there's data
      const hasData = await page.locator("text=睡眠数据看板").isVisible();
      if (!hasData) {
        // Navigate to history page which always has logout button
        await page.goto("/history");
        await expect(page.locator("text=加载中")).not.toBeVisible({ timeout: 10000 });
      }

      // Logout
      await page.locator('button[aria-label="登出"]').click();
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      // Try to access dashboard
      await page.goto("/dashboard");

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
