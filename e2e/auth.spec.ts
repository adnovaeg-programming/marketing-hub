import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("homepage redirects to /ar", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/ar/login");
    await page.waitForLoadState("networkidle");

    // نتحقق من الـ inputs (مش نص محدد عشان TextScramble)
    await expect(page.locator('input[name="email"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("register page renders with account types", async ({ page }) => {
    await page.goto("/ar/register");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[name="name"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/ar/forgot-password");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[name="email"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("h1")).toBeVisible();
  });

  test("legal pages accessible", async ({ page }) => {
    await page.goto("/ar/legal/privacy");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    await page.goto("/ar/legal/terms");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    await page.goto("/ar/legal/cookies");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
  });
});