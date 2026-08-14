import { expect, test } from "@playwright/test";

test("landing page shows the public product messaging", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Role-based access is now part of the app's core flow.",
    })
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Sign in",
    })
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Create account",
    })
  ).toBeVisible();
});
