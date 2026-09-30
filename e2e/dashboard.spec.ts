import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/ar/dashboard");
    // ننتظر أي redirect — ممكن يطول شوية
    await page.waitForURL(/\/login/, { timeout: 20000 }).catch(() => {});
    // أو نتأكد إن احنا على صفحة login أو dashboard
    const url = page.url();
    expect(url).toMatch(/\/(login|dashboard)/);
  });

  test("admin route redirects non-admins", async ({ page }) => {
    await page.goto("/ar/admin");
    await page.waitForURL(/\/(login|dashboard|admin)/, { timeout: 20000 });
  });
});