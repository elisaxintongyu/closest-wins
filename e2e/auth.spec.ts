import { expect, test } from "@playwright/test";
import {
  createPlayerTestAccount,
  signInFromPage,
  signInWithSession,
  signOut,
} from "./helpers/auth";
import { ensureUser, prisma } from "./helpers/db";

test("signed-out visitors see entry CTAs and are redirected from protected pages", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Role-based access is now part of the app's core flow.",
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Create account" })
  ).toBeVisible();

  await page.goto("/admin");
  await page.waitForURL("/sign-in");

  await page.goto("/player");
  await page.waitForURL("/sign-in");
});

test("demo admin sign-in lands in the admin dashboard and dashboard stays role-aware", async ({
  page,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });

  await signInFromPage(page, "Continue as demo admin");

  await expect(
    page.getByRole("heading", { name: "Create and manage game sessions." })
  ).toBeVisible();

  await page.goto("/dashboard");
  await page.waitForURL("/admin");
});

test("demo player sign-in lands in the player dashboard and session persists", async ({
  page,
}) => {
  await ensureUser({
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  await signInFromPage(page, "Continue as demo player");

  await expect(
    page.getByRole("heading", {
      name: "Create your team and head into the game.",
    })
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("heading", {
      name: "Create your team and head into the game.",
    })
  ).toBeVisible();

  await page.goto("/dashboard");
  await page.waitForURL("/player");
});

test("test sign-up creates a player account and stores a player role in the database", async ({
  page,
}) => {
  const email = `player+${Date.now()}@closestwins.com`;
  const name = "E2E New Player";

  await createPlayerTestAccount(page, { email, name });

  await expect(
    page.getByRole("heading", {
      name: "Create your team and head into the game.",
    })
  ).toBeVisible();

  const createdUser = await prisma.user.findUnique({
    where: { email },
    select: { email: true, role: true, name: true },
  });

  expect(createdUser).toMatchObject({
    email,
    role: "PLAYER",
    name,
  });
});

test("sign-out removes access to protected routes", async ({ page }) => {
  await ensureUser({
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  await signInWithSession(page, {
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  await signOut(page);

  await page.goto("/player");
  await page.waitForURL("/sign-in");
});
