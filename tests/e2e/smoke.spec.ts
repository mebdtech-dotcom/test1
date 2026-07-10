import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// E2E + a11y smoke (Doc-8B Bands H/I) — proves the Playwright runner serves the app and the axe
// accessibility scan runs (WCAG baseline; Doc-7A R11). Asserts the real Doc-7D public landing hero
// (SEC-HERO) renders its single <h1> value-proposition; the brand wordmark lives in the nav logo,
// not the heading. Deep surface E2E lands with the Doc-7 frontend waves.
test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Industrial Procurement");
});

test("home page has no automatically-detectable a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
