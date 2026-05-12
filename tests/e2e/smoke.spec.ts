import { test, expect } from "@playwright/test";

/**
 * Cold-boot smoke. Doesn't depend on backend connectivity — only checks
 * that the marketing surface mounts, and that the protected /app/* tree
 * renders its shell (status pill, nav, error boundary in standby).
 */

test.describe("smoke @critical", () => {
  test("landing page mounts and shows brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Glimmora/i);
    // Brand wordmark or hero copy should be present
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("dashboard shell renders chrome", async ({ page }) => {
    await page.goto("/app/dashboard");
    // App shell sidebar
    await expect(page.locator("nav")).toBeVisible();
    // Status pill (topbar)
    await expect(page.getByText(/operational|degraded|down|connecting/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("AGI page mounts and lists agents", async ({ page }) => {
    await page.goto("/app/agi");
    // Phase 5 dashboard heading
    await expect(page.getByText(/persistent agents/i)).toBeVisible({ timeout: 10_000 });
  });

  test("404 page does not crash", async ({ page }) => {
    const resp = await page.goto("/this-route-does-not-exist");
    // Next renders a 404 page — either status 404 or the boundary catches it
    expect([200, 404]).toContain(resp?.status() ?? 0);
  });
});
