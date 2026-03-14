import { test } from "@playwright/test";

// This file takes screenshots of key UI states.
// Run with: pnpm snapshot
// Claude Code reads the resulting images to verify UI changes visually.

test.describe("Visual snapshots", () => {
  test("homepage loads with map and sidebar", async ({ page }) => {
    await page.goto("/");
    // Wait for the map to fully render
    await page
      .waitForSelector(".maplibregl-canvas", { timeout: 15_000 })
      .catch(() => {});
    // Wait for station data to load (Loading stations... disappears)
    await page
      .waitForFunction(() => !document.body.textContent?.includes("Loading stations"), {
        timeout: 30_000,
      })
      .catch(() => {});
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `snapshots/${test.info().project.name}-homepage.png`,
      fullPage: false,
    });
  });

  test("search bar is visible and interactive", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    // Use first visible search input (desktop sidebar or mobile sheet)
    const searchInput = page.getByRole("textbox", { name: "Search by postcode" }).first();
    await searchInput.fill("SW1A 1AA");
    await page.screenshot({
      path: `snapshots/${test.info().project.name}-search-filled.png`,
      fullPage: false,
    });
  });

  test("fuel filter buttons work", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    // Use first visible Diesel button
    const dieselBtn = page.getByRole("radio", { name: "Diesel", exact: true }).first();
    await dieselBtn.click();
    await page.screenshot({
      path: `snapshots/${test.info().project.name}-diesel-selected.png`,
      fullPage: false,
    });
  });
});
