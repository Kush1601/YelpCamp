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
