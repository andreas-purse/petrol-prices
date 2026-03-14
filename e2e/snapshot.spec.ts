import { test, expect } from "@playwright/test";

// This file takes screenshots of key UI states.
// Run with: pnpm snapshot
// Claude Code reads the resulting images to verify UI changes visually.

test.describe("Visual snapshots", () => {
  test("homepage loads with map and sidebar", async ({ page }) => {
    await page.goto("/");
    // Wait for the map container to be visible
    await page.waitForSelector(".maplibregl-map, [data-testid='map-loading']", {
      timeout: 15_000,
    }).catch(() => {
      // Map may not load without tiles in CI, that's fine
    });
    // Small wait for UI to settle
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `snapshots/${test.info().project.name}-homepage.png`, fullPage: false });
  });

  test("search bar is visible and interactive", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder("Enter postcode");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("SW1A 1AA");
    await page.screenshot({ path: `snapshots/${test.info().project.name}-search-filled.png`, fullPage: false });
  });

  test("fuel filter buttons work", async ({ page }) => {
    await page.goto("/");
    // Click Diesel filter
    const dieselBtn = page.getByRole("radio", { name: "Diesel" });
    await expect(dieselBtn).toBeVisible();
    await dieselBtn.click();
    await page.screenshot({ path: `snapshots/${test.info().project.name}-diesel-selected.png`, fullPage: false });
  });
});
