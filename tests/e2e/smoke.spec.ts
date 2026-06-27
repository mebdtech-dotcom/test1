import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Wave 0 E2E + a11y smoke (Doc-8B Bands H/I) — proves the Playwright runner serves the app and
// the axe accessibility scan runs (WCAG baseline; Doc-7A R11). Spine-only: the public landing
// placeholder. Real surface E2E lands with the Doc-7 frontend waves.
test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("iVendorz");
});

test("home page has no automatically-detectable a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
