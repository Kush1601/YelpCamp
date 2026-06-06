import { test, expect } from "@playwright/test";

test("homepage loads and links to campgrounds", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find your next campsite/i })).toBeVisible();
  await page.getByRole("link", { name: /browse campgrounds/i }).click();
  await expect(page).toHaveURL(/\/campgrounds/);
});

test("full-text search page renders", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: /full-text search/i })).toBeVisible();
});

test("campgrounds list loads and shows listings", async ({ page }) => {
  await page.goto("/campgrounds");
  await expect(page.getByRole("heading", { name: /all campgrounds/i })).toBeVisible();
  // Seeded DB has 120 campgrounds — at least one card h2 must be present
  await expect(page.locator(".grid a h2").first()).toBeVisible();
});
