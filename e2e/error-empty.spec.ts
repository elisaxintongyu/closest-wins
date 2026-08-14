import { expect, test } from "@playwright/test";
import { signInWithSession } from "./helpers/auth";
import {
  addPlayerToTeam,
  addQuestionsToGame,
  createGameForAdmin,
  createTeamForPlayer,
  ensureUser,
} from "./helpers/db";

test("admin empty states and validation errors are visible where the admin works", async ({
  page,
}) => {
  const adminEmail = `empty-admin+${Date.now()}@closestwins.com`;

  await ensureUser({
    email: adminEmail,
    name: "Empty Admin",
    role: "ADMIN",
  });

  await signInWithSession(page, {
    email: adminEmail,
    name: "Empty Admin",
    role: "ADMIN",
  });

  await page.goto("/admin");
  await expect(
    page.getByText("No games yet. Create one to begin the admin game flow.")
  ).toBeVisible();

  await page.getByRole("button", { name: "Create game" }).click();
  await expect(page.getByText("Game title is required.")).toBeVisible();

  const emptyGame = await createGameForAdmin({
    adminEmail,
    title: `Empty admin game ${Date.now()}`,
  });

  await page.goto(`/admin/games/${emptyGame.id}`);
  await expect(page.getByText("This game has no questions yet.")).toBeVisible();

  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByText("Question prompt is required.")).toBeVisible();
  await expect(
    page.getByText("A correct numerical answer is required.")
  ).toBeVisible();
});

test("player empty states, invalid join codes, and duplicate team names are visible", async ({
  page,
}) => {
  await ensureUser({
    email: "empty-player@closestwins.com",
    name: "Empty Player",
    role: "PLAYER",
  });
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await ensureUser({
    email: "other-player@closestwins.com",
    name: "Other Player",
    role: "PLAYER",
  });

  await signInWithSession(page, {
    email: "empty-player@closestwins.com",
    name: "Empty Player",
    role: "PLAYER",
  });

  await page.goto("/player");
  await expect(
    page.getByText("No active game pages yet. Join a game above to create your first team home.")
  ).toBeVisible();

  await page.goto("/player?joinCode=BAD000");
  await expect(page.getByText("No game matched BAD000.")).toBeVisible();

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Duplicate team game ${Date.now()}`,
  });
  await createTeamForPlayer({
    gameId: game.id,
    userEmail: "other-player@closestwins.com",
    teamName: "Shared Team",
  });

  await page.goto(`/player?joinCode=${game.joinCode}`);
  await page.getByLabel("Team name").fill("Shared Team");
  await page.getByRole("button", { name: "Create team" }).click();

  await expect(
    page.getByText("That team name is already taken in this game.")
  ).toBeVisible();
});

test("player pages show waiting, duplicate-guess, and round-closed error states", async ({
  browser,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await ensureUser({
    email: "captain@closestwins.com",
    name: "Captain Player",
    role: "PLAYER",
  });
  await ensureUser({
    email: "teammate@closestwins.com",
    name: "Teammate Player",
    role: "PLAYER",
  });
  await ensureUser({
    email: "late-player@closestwins.com",
    name: "Late Player",
    role: "PLAYER",
  });

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Player error states ${Date.now()}`,
  });
  await addQuestionsToGame(game.id, [
    {
      prompt: "How many planets are in the solar system?",
      correctAnswer: 8,
      explanation: "There are eight recognized planets.",
    },
  ]);

  const alphaTeam = await createTeamForPlayer({
    gameId: game.id,
    userEmail: "captain@closestwins.com",
    teamName: "Alpha Team",
  });
  await addPlayerToTeam({
    gameId: game.id,
    teamId: alphaTeam.id,
    userEmail: "teammate@closestwins.com",
  });
  await createTeamForPlayer({
    gameId: game.id,
    userEmail: "late-player@closestwins.com",
    teamName: "Beta Team",
  });

  const adminContext = await browser.newContext();
  const captainContext = await browser.newContext();
  const teammateContext = await browser.newContext();
  const lateContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const captainPage = await captainContext.newPage();
  const teammatePage = await teammateContext.newPage();
  const latePage = await lateContext.newPage();

  await signInWithSession(adminPage, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await signInWithSession(captainPage, {
    email: "captain@closestwins.com",
    name: "Captain Player",
    role: "PLAYER",
  });
  await signInWithSession(teammatePage, {
    email: "teammate@closestwins.com",
    name: "Teammate Player",
    role: "PLAYER",
  });
  await signInWithSession(latePage, {
    email: "late-player@closestwins.com",
    name: "Late Player",
    role: "PLAYER",
  });

  await captainPage.goto(`/player/games/${game.id}`);
  await teammatePage.goto(`/player/games/${game.id}`);
  await latePage.goto(`/player/games/${game.id}`);

  await expect(
    captainPage.getByRole("heading", { name: "Waiting for the next round" })
  ).toBeVisible();

  await adminPage.goto(`/admin/games/${game.id}`);
  await adminPage
    .locator("article")
    .filter({ hasText: "Question 1" })
    .getByRole("button", { name: "Open round" })
    .click();

  await captainPage.reload();
  await teammatePage.reload();
  await latePage.reload();
  await captainPage.getByLabel("Team guess").fill("7");
  await captainPage.getByRole("button", { name: "Submit guess" }).click();
  await expect(
    captainPage.getByText("Submitted 7 for Alpha Team in round 1.")
  ).toBeVisible();

  await teammatePage.getByLabel("Team guess").fill("9");
  await teammatePage.getByRole("button", { name: "Submit guess" }).click();
  await expect(
    teammatePage.getByText("Your team already submitted 7 for this round.")
  ).toBeVisible();

  await adminPage
    .locator("article")
    .filter({ hasText: "Question 1" })
    .getByRole("button", { name: "Close round" })
    .click();

  await latePage.getByLabel("Team guess").fill("10");
  await latePage.getByRole("button", { name: "Submit guess" }).click();
  await expect(
    latePage.getByText("That round is no longer accepting guesses.")
  ).toBeVisible();

  await adminContext.close();
  await captainContext.close();
  await teammateContext.close();
  await lateContext.close();
});
