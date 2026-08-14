import { type Page } from "@playwright/test";
import {
  E2E_TEST_SESSION_COOKIE,
  encodeE2ETestSession,
} from "../../src/lib/test-mode";

type E2ESessionInput = {
  email: string;
  name: string;
  role: "ADMIN" | "PLAYER";
};

export async function signInFromPage(
  page: Page,
  buttonName: "Continue as demo admin" | "Continue as demo player"
) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: buttonName }).click();
  await page.waitForURL(/\/(admin|player)$/);
}

export async function createPlayerTestAccount(
  page: Page,
  input: Pick<E2ESessionInput, "email" | "name">
) {
  await page.goto("/sign-up");
  await page.getByLabel("Player name").fill(input.name);
  await page.getByLabel("Player email").fill(input.email);
  await page
    .getByRole("button", { name: "Create player test account" })
    .click();
  await page.waitForURL("/player");
}

export async function signInWithSession(page: Page, input: E2ESessionInput) {
  await page.context().addCookies([
    {
      name: E2E_TEST_SESSION_COOKIE,
      value: encodeE2ETestSession(input),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/dashboard");
  await page.waitForURL(/\/(admin|player)$/);
}

export async function signOut(page: Page) {
  await page.context().clearCookies();
  await page.goto("/");
  await page.waitForURL("/");
}
