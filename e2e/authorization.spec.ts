import { expect, test, type Page } from "@playwright/test";
import { signInWithSession } from "./helpers/auth";
import {
  addQuestionsToGame,
  createGameForAdmin,
  createTeamForPlayer,
  ensureUser,
  prisma,
} from "./helpers/db";

type AuthorizationProbePayload =
  | { intent: "admin-game"; gameId: string }
  | { intent: "admin-question"; questionId: string }
  | { intent: "player-membership"; gameId: string };

async function callAuthorizationProbe(
  page: Page,
  body: AuthorizationProbePayload
) {
  return page.evaluate(async (payload: AuthorizationProbePayload) => {
    const response = await fetch("/api/test/probe", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return {
      status: response.status,
      json: await response.json(),
    };
  }, body);
}

test("signed-out users are redirected away from protected nested routes", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.waitForURL("/sign-in");

  await page.goto("/player/games/not-a-real-game");
  await page.waitForURL("/sign-in");

  await page.goto("/player/lobby/not-a-real-game");
  await page.waitForURL("/sign-in");
});

test("admins are redirected away from player-only routes and players are redirected away from admin-only routes", async ({
  browser,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await ensureUser({
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  const adminContext = await browser.newContext();
  const playerContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const playerPage = await playerContext.newPage();

  await signInWithSession(adminPage, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await signInWithSession(playerPage, {
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  await adminPage.goto("/player");
  await adminPage.waitForURL("/admin");

  await playerPage.goto("/admin");
  await playerPage.waitForURL("/player");

  await adminContext.close();
  await playerContext.close();
});

test("players cannot access another game's pages or membership-protected mutations", async ({
  browser,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await ensureUser({
    email: "player.one@closestwins.com",
    name: "Player One",
    role: "PLAYER",
  });
  await ensureUser({
    email: "player.two@closestwins.com",
    name: "Player Two",
    role: "PLAYER",
  });

  const gameOne = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Auth game one ${Date.now()}`,
  });
  const gameTwo = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Auth game two ${Date.now()}`,
  });

  await addQuestionsToGame(gameTwo.id, [
    {
      prompt: "Protected prompt",
      correctAnswer: 12,
      explanation: "Only team members should reach this round.",
    },
  ]);
  await createTeamForPlayer({
    gameId: gameOne.id,
    userEmail: "player.one@closestwins.com",
    teamName: "Alpha Team",
  });
  await createTeamForPlayer({
    gameId: gameTwo.id,
    userEmail: "player.two@closestwins.com",
    teamName: "Beta Team",
  });

  const playerContext = await browser.newContext();
  const playerPage = await playerContext.newPage();

  await signInWithSession(playerPage, {
    email: "player.one@closestwins.com",
    name: "Player One",
    role: "PLAYER",
  });

  await playerPage.goto(`/player/games/${gameTwo.id}`);
  await expect(playerPage.getByText("This page could not be found.")).toBeVisible();

  await playerPage.goto(`/player/lobby/${gameTwo.id}`);
  await expect(playerPage.getByText("This page could not be found.")).toBeVisible();

  const membershipProbe = await callAuthorizationProbe(playerPage, {
    intent: "player-membership",
    gameId: gameTwo.id,
  });
  expect(membershipProbe.status).toBe(404);

  await playerContext.close();
});

test("admins cannot mutate another admin's game or question set by ID", async ({
  browser,
}) => {
  await ensureUser({
    email: "admin.one@closestwins.com",
    name: "Admin One",
    role: "ADMIN",
  });
  await ensureUser({
    email: "admin.two@closestwins.com",
    name: "Admin Two",
    role: "ADMIN",
  });

  const ownedGame = await createGameForAdmin({
    adminEmail: "admin.two@closestwins.com",
    title: `Foreign admin game ${Date.now()}`,
  });
  await addQuestionsToGame(ownedGame.id, [
    {
      prompt: "Locked down question",
      correctAnswer: 9,
      explanation: "Only the owner should mutate this.",
    },
  ]);

  const foreignQuestion = await prisma.question.findFirstOrThrow({
    where: {
      gameId: ownedGame.id,
    },
    select: {
      id: true,
    },
  });

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  await signInWithSession(adminPage, {
    email: "admin.one@closestwins.com",
    name: "Admin One",
    role: "ADMIN",
  });

  await adminPage.goto(`/admin/games/${ownedGame.id}`);
  await expect(adminPage.getByText("This page could not be found.")).toBeVisible();

  const foreignGameProbe = await callAuthorizationProbe(adminPage, {
    intent: "admin-game",
    gameId: ownedGame.id,
  });
  expect(foreignGameProbe.status).toBe(404);

  const foreignQuestionProbe = await callAuthorizationProbe(adminPage, {
    intent: "admin-question",
    questionId: foreignQuestion.id,
  });
  expect(foreignQuestionProbe.status).toBe(404);

  await adminContext.close();
});
