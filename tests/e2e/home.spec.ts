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

test("pagination navigates to a different page of campgrounds", async ({ page }) => {
  await page.goto("/campgrounds");
  const firstPageTitle = await page.locator(".grid a h2").first().textContent();

  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page).toHaveURL(/[?&]page=2/);
  await expect(page.locator(".grid a h2").first()).not.toHaveText(firstPageTitle ?? "");
});

test("full-text search returns results for a query", async ({ page }) => {
  await page.goto("/search");
  await page.getByPlaceholder(/forest, river, quiet/i).fill("forest");
  await page.getByRole("button", { name: /search/i }).click();
  await expect(page.getByText(/hits · query \d+ms/)).toBeVisible();
  await expect(page.locator("ul li").first()).toBeVisible();
});
