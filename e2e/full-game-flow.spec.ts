import { expect, test, type Page } from "@playwright/test";
import { getScoreboard } from "../src/lib/gameplay";
import { signInWithSession } from "./helpers/auth";
import {
  addQuestionsToGame,
  createGameForAdmin,
  createPresetTeamForGame,
  ensureUser,
  prisma,
} from "./helpers/db";

async function joinGame(page: Page, joinCode: string, teamName: string) {
  await page.goto(`/player?joinCode=${joinCode}`);
  await expect(page.getByText("Game found")).toBeVisible();
  await page.getByLabel("Available teams").selectOption({ label: teamName });
  await page.getByRole("button", { name: "Join team" }).click();
  await page.waitForURL(new RegExp(`/player/games/.+`));
}

function getQuestionCard(page: Page, questionNumber: number) {
  return page.locator("article").filter({
    hasText: `Question ${questionNumber}`,
  });
}

test("single-round gameplay flows from join to reveal and completion", async ({
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

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Single round flow ${Date.now()}`,
  });
  await addQuestionsToGame(game.id, [
    {
      prompt: "How many minutes are in an hour?",
      correctAnswer: 60,
      explanation: "One hour contains 60 minutes.",
    },
  ]);
  await createPresetTeamForGame({
    gameId: game.id,
    teamName: "Alpha Team",
  });

  const adminContext = await browser.newContext();
  const playerContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const playerGamePage = await playerContext.newPage();
  const playerLobbyPage = await playerContext.newPage();

  await signInWithSession(adminPage, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await signInWithSession(playerGamePage, {
    email: "player.one@closestwins.com",
    name: "Player One",
    role: "PLAYER",
  });

  await joinGame(playerGamePage, game.joinCode, "Alpha Team");
  await playerLobbyPage.goto(`/player/lobby/${game.id}`);

  await adminPage.goto(`/admin/games/${game.id}`);
  await adminPage.getByRole("button", { name: "Open round" }).click();

  await expect
    .poll(async () => {
      const firstQuestion = await prisma.question.findFirstOrThrow({
        where: { gameId: game.id, order: 1 },
        select: { status: true },
      });

      return firstQuestion.status;
    })
    .toBe("OPEN");

  await playerGamePage.reload();
  await playerLobbyPage.reload();
  await expect(
    playerGamePage.getByRole("heading", {
      name: "How many minutes are in an hour?",
    })
  ).toBeVisible();
  await expect(
    playerLobbyPage.getByRole("heading", {
      name: "How many minutes are in an hour?",
    })
  ).toBeVisible();

  await playerGamePage.getByLabel("Team guess").fill("58");
  await playerGamePage.getByRole("button", { name: "Submit guess" }).click();
  await expect(
    playerGamePage.getByText("Submitted 58 for Alpha Team in round 1.")
  ).toBeVisible();

  await adminPage.reload();
  const adminQuestionCard = getQuestionCard(adminPage, 1);
  await expect(adminQuestionCard.getByText("1 of 1 team submitted")).toBeVisible();
  await expect(adminQuestionCard.getByText("1. Alpha Team")).toBeVisible();
  await expect(adminQuestionCard.getByText("58")).toBeVisible();

  await adminQuestionCard.getByRole("button", { name: "Close round" }).click();
  await adminQuestionCard
    .getByRole("button", { name: "Reveal answer" })
    .click();

  await expect
    .poll(async () => {
      const updatedGame = await prisma.game.findUniqueOrThrow({
        where: { id: game.id },
        select: {
          status: true,
          questions: {
            select: {
              status: true,
            },
          },
        },
      });

      return {
        status: updatedGame.status,
        questionStatus: updatedGame.questions[0]?.status,
      };
    })
    .toMatchObject({
      status: "COMPLETED",
      questionStatus: "REVEALED",
    });

  await playerGamePage.reload();
  await playerLobbyPage.reload();
  await expect(playerGamePage.getByText("Winner: Alpha Team")).toBeVisible();
  await expect(
    playerLobbyPage.getByText("Closest guess: 58 (off by 2)")
  ).toBeVisible();
  await expect(playerGamePage.getByText("1 round win")).toBeVisible();

  const persistedGame = await prisma.game.findUniqueOrThrow({
    where: { id: game.id },
    select: {
      status: true,
      questions: {
        select: {
          status: true,
          guesses: {
            select: {
              value: true,
            },
          },
        },
      },
    },
  });

  expect(persistedGame.status).toBe("COMPLETED");
  expect(persistedGame.questions[0]?.status).toBe("REVEALED");
  expect(persistedGame.questions[0]?.guesses).toEqual([{ value: 58 }]);

  await adminPage.goto("/admin");
  const completedCard = adminPage.locator("article").filter({
    hasText: game.title,
  });
  await expect(completedCard.first()).toContainText("COMPLETED");

  await adminContext.close();
  await playerContext.close();
});

test("multi-round gameplay handles ties and ends with a completed scoreboard", async ({
  browser,
}) => {
  test.setTimeout(60_000);

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

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Multi round flow ${Date.now()}`,
  });
  await addQuestionsToGame(game.id, [
    {
      prompt: "What is 10 squared?",
      correctAnswer: 100,
      explanation: "10 squared equals 100.",
    },
    {
      prompt: "How many weeks are in a year?",
      correctAnswer: 52,
      explanation: "Most calendar years contain 52 weeks.",
    },
  ]);
  await createPresetTeamForGame({
    gameId: game.id,
    teamName: "Alpha Team",
  });
  await createPresetTeamForGame({
    gameId: game.id,
    teamName: "Beta Team",
  });

  const adminContext = await browser.newContext();
  const playerOneContext = await browser.newContext();
  const playerTwoContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const playerOneGamePage = await playerOneContext.newPage();
  const playerOneLobbyPage = await playerOneContext.newPage();
  const playerTwoGamePage = await playerTwoContext.newPage();

  await signInWithSession(adminPage, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });
  await signInWithSession(playerOneGamePage, {
    email: "player.one@closestwins.com",
    name: "Player One",
    role: "PLAYER",
  });
  await signInWithSession(playerTwoGamePage, {
    email: "player.two@closestwins.com",
    name: "Player Two",
    role: "PLAYER",
  });

  await joinGame(playerOneGamePage, game.joinCode, "Alpha Team");
  await joinGame(playerTwoGamePage, game.joinCode, "Beta Team");
  await playerOneLobbyPage.goto(`/player/lobby/${game.id}`);

  await adminPage.goto(`/admin/games/${game.id}`);

  await getQuestionCard(adminPage, 1)
    .getByRole("button", { name: "Open round" })
    .click();

  await expect
    .poll(async () => {
      const firstQuestion = await prisma.question.findFirstOrThrow({
        where: { gameId: game.id, order: 1 },
        select: { status: true },
      });

      return firstQuestion.status;
    })
    .toBe("OPEN");

  await playerOneGamePage.goto(`/player/games/${game.id}`);
  await playerOneLobbyPage.goto(`/player/lobby/${game.id}`);
  await playerTwoGamePage.goto(`/player/games/${game.id}`);
  await expect(playerOneLobbyPage.getByText("Round 1 is open")).toBeVisible();
  await expect(
    playerOneGamePage.getByRole("heading", { name: "What is 10 squared?" })
  ).toBeVisible();
  await expect(
    playerTwoGamePage.getByRole("heading", { name: "What is 10 squared?" })
  ).toBeVisible();

  await playerOneGamePage.getByLabel("Team guess").fill("90");
  await playerOneGamePage.getByRole("button", { name: "Submit guess" }).click();
  await playerTwoGamePage.getByLabel("Team guess").fill("110");
  await playerTwoGamePage.getByRole("button", { name: "Submit guess" }).click();

  await getQuestionCard(adminPage, 1)
    .getByRole("button", { name: "Close round" })
    .click();
  await getQuestionCard(adminPage, 1)
    .getByRole("button", { name: "Reveal answer" })
    .click();

  await expect
    .poll(async () => {
      const firstQuestion = await prisma.question.findFirstOrThrow({
        where: { gameId: game.id, order: 1 },
        select: { status: true },
      });

      return firstQuestion.status;
    })
    .toBe("REVEALED");

  await playerOneGamePage.reload();
  await playerOneLobbyPage.reload();
  await playerTwoGamePage.reload();
  await expect(
    playerOneGamePage.getByText(/Winners?: .*Alpha Team.*Beta Team/)
  ).toBeVisible();
  await expect(playerOneLobbyPage.getByText("1 round win")).toHaveCount(2);
  await expect(playerTwoGamePage.getByText("1 round win")).toHaveCount(2);

  await getQuestionCard(adminPage, 2)
    .getByRole("button", { name: "Open round" })
    .click();

  await expect
    .poll(async () => {
      const secondQuestion = await prisma.question.findFirstOrThrow({
        where: { gameId: game.id, order: 2 },
        select: { status: true },
      });

      return secondQuestion.status;
    })
    .toBe("OPEN");

  await playerOneGamePage.goto(`/player/games/${game.id}`);
  await playerTwoGamePage.goto(`/player/games/${game.id}`);
  await expect(playerOneGamePage.getByText("Round 2 is open")).toBeVisible();

  await playerOneGamePage.getByLabel("Team guess").fill("52");
  await playerOneGamePage.getByRole("button", { name: "Submit guess" }).click();
  await playerTwoGamePage.getByLabel("Team guess").fill("80");
  await playerTwoGamePage.getByRole("button", { name: "Submit guess" }).click();

  await getQuestionCard(adminPage, 2)
    .getByRole("button", { name: "Close round" })
    .click();
  await getQuestionCard(adminPage, 2)
    .getByRole("button", { name: "Reveal answer" })
    .click();

  await expect
    .poll(async () => {
      const updatedGame = await prisma.game.findUniqueOrThrow({
        where: { id: game.id },
        select: { status: true },
      });

      return updatedGame.status;
    })
    .toBe("COMPLETED");

  await playerOneGamePage.goto(`/player/games/${game.id}`);
  await playerOneLobbyPage.goto(`/player/lobby/${game.id}`);
  await playerTwoGamePage.goto(`/player/games/${game.id}`);

  await expect
    .poll(async () => {
      const snapshot = await prisma.game.findUniqueOrThrow({
        where: { id: game.id },
        select: {
          status: true,
          questions: {
            orderBy: { order: "asc" },
            select: {
              status: true,
              guesses: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      return {
        status: snapshot.status,
        questionStatuses: snapshot.questions.map((question) => question.status),
      };
    })
    .toEqual({
      status: "COMPLETED",
      questionStatuses: ["REVEALED", "REVEALED"],
    });

  const persistedGame = await prisma.game.findUniqueOrThrow({
    where: { id: game.id },
    select: {
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          correctAnswer: true,
          guesses: {
            select: {
              value: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  expect(
    getScoreboard(
      persistedGame.teams,
      persistedGame.questions.map((question) => ({
        correctAnswer: question.correctAnswer,
        guesses: question.guesses,
      }))
    )
  ).toEqual([
    {
      id: expect.any(String),
      name: "Alpha Team",
      score: 2,
      wins: 2,
    },
    {
      id: expect.any(String),
      name: "Beta Team",
      score: 1,
      wins: 1,
    },
  ]);

  await adminPage.goto("/admin");
  const completedCard = adminPage.locator("article").filter({
    hasText: game.title,
  });
  await expect(completedCard.first()).toContainText("COMPLETED");
  await expect(completedCard.first()).toContainText("Alpha Team");

  await adminContext.close();
  await playerOneContext.close();
  await playerTwoContext.close();
});

test("admin can explicitly end and reset a game session", async ({
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

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Game control flow ${Date.now()}`,
  });
  await addQuestionsToGame(game.id, [
    {
      prompt: "How many hours are in a day?",
      correctAnswer: 24,
      explanation: "A day contains 24 hours.",
    },
  ]);
  await createPresetTeamForGame({
    gameId: game.id,
    teamName: "Alpha Team",
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
    email: "player.one@closestwins.com",
    name: "Player One",
    role: "PLAYER",
  });

  await joinGame(playerPage, game.joinCode, "Alpha Team");
  await adminPage.goto(`/admin/games/${game.id}`);

  await adminPage.getByRole("button", { name: "End game" }).click();

  await expect
    .poll(async () => {
      const endedGame = await prisma.game.findUniqueOrThrow({
        where: { id: game.id },
        select: { status: true },
      });

      return endedGame.status;
    })
    .toBe("COMPLETED");

  await playerPage.goto(`/player/games/${game.id}`);
  await expect(playerPage.getByText("Current status: COMPLETED")).toBeVisible();

  await adminPage.goto(`/admin/games/${game.id}`);
  await adminPage.getByRole("button", { name: "Reset game" }).click();

  await expect
    .poll(async () => {
      const resetGame = await prisma.game.findUniqueOrThrow({
        where: { id: game.id },
        select: {
          status: true,
          questions: {
            select: {
              status: true,
              guesses: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      return {
        status: resetGame.status,
        questionStatus: resetGame.questions[0]?.status,
        guessCount: resetGame.questions[0]?.guesses.length ?? 0,
      };
    })
    .toEqual({
      status: "DRAFT",
      questionStatus: "HIDDEN",
      guessCount: 0,
    });

  await playerPage.goto(`/player/games/${game.id}`);
  await expect(playerPage.getByText("Current status: DRAFT")).toBeVisible();
  await expect(
    playerPage.getByRole("heading", { name: "Waiting for the next round" })
  ).toBeVisible();

  await adminContext.close();
  await playerContext.close();
});
