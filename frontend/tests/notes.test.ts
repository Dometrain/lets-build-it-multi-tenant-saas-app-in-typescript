import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/app/notes");
});

test("should display the notes page", async ({ page }) => {
  await expect(page.locator("h1")).toHaveText("Notes");
});
