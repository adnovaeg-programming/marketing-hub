import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with hero section", async ({ page }) => {
    await page.goto("/ar");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("كل تسويقك في");
  });

  test("features section exists", async ({ page }) => {
    await page.goto("/ar");
    const features = page.locator("#features");
    await features.scrollIntoViewIfNeeded();
    await expect(features).toBeVisible();
    await expect(page.getByText("روزنامة موحدة")).toBeVisible();
  });

  test("pricing section exists", async ({ page }) => {
    await page.goto("/ar");
    const pricing = page.locator("#pricing");
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing).toBeVisible();
  });

  test("language switcher changes URL", async ({ page }) => {
    await page.goto("/ar");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");

    const langBtn = page.locator('button[aria-label*="Switch"]').first();
    await expect(langBtn).toBeVisible({ timeout: 5000 });
    await langBtn.click();

    // نتأكد إن الـ URL اتغير لـ /en
    await page.waitForURL(/\/en/, { timeout: 15000 });
    expect(page.url()).toContain("/en");
  });

  test("English landing page renders correctly", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("All your marketing");
  });
});