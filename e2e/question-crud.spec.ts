import path from "node:path";
import { expect, test } from "@playwright/test";
import { signInWithSession } from "./helpers/auth";
import {
  createGameForAdmin,
  ensureUser,
  getQuestionsForGame,
  prisma,
} from "./helpers/db";

test("admin can create, edit, reorder, and delete questions with persisted ordering", async ({
  page,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });

  await signInWithSession(page, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });

  const gameTitle = `Milestone 6 CRUD ${Date.now()}`;

  await page.goto("/admin");
  await page.getByLabel("Game title").fill(gameTitle);
  await page.getByRole("button", { name: "Create game" }).click();

  const gameLink = page
    .locator("article")
    .filter({ hasText: gameTitle })
    .getByRole("link", { name: "Manage questions" });
  await expect(gameLink).toBeVisible();
  await gameLink.click();

  await expect(page.getByText("This game has no questions yet.")).toBeVisible();
  const gameId = page.url().split("/").at(-1);
  expect(gameId).toBeTruthy();

  const createQuestionForm = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Add question" }) });

  const prompts = [
    "How many inches are in a yard?",
    "How many players start on a baseball team?",
    "How many letters are in the Greek alphabet?",
  ];

  for (const [index, prompt] of prompts.entries()) {
    await createQuestionForm.getByLabel("Prompt").fill(prompt);
    await createQuestionForm
      .getByLabel("Correct answer")
      .fill(String(index + 3));
    await createQuestionForm
      .getByLabel("Explanation")
      .fill(`Explanation ${index + 1}`);
    await createQuestionForm.getByRole("button", { name: "Add question" }).click();
    await expect(page.getByText("Question created.")).toBeVisible();
    await expect
      .poll(() => getQuestionsForGame(gameId!))
      .toHaveLength(index + 1);
  }

  let questions = await getQuestionsForGame(gameId!);
  expect(questions.map((question) => question.prompt)).toEqual(prompts);
  expect(questions.map((question) => question.order)).toEqual([1, 2, 3]);

  const secondQuestionCard = page.locator("article").filter({
    hasText: "Question 2",
  });
  await secondQuestionCard.getByLabel("Prompt").fill("Updated baseball roster");
  await secondQuestionCard.getByLabel("Correct answer").fill("9");
  await secondQuestionCard
    .getByLabel("Explanation")
    .fill("Nine players start on defense.");
  await secondQuestionCard.getByRole("button", { name: "Save changes" }).click();
  await expect(secondQuestionCard.getByText("Question saved.")).toBeVisible();

  await expect
    .poll(async () => {
      const updatedQuestions = await getQuestionsForGame(gameId!);
      return updatedQuestions[1];
    })
    .toMatchObject({
      prompt: "Updated baseball roster",
      correctAnswer: 9,
      explanation: "Nine players start on defense.",
    });

  const thirdQuestionCard = page.locator("article").filter({
    hasText: "Question 3",
  });
  await thirdQuestionCard.getByRole("button", { name: "Move up" }).click();

  await expect
    .poll(async () => {
      const reorderedQuestions = await getQuestionsForGame(gameId!);
      return reorderedQuestions.map((question) => ({
        prompt: question.prompt,
        order: question.order,
      }));
    })
    .toEqual([
      { prompt: "How many inches are in a yard?", order: 1 },
      { prompt: "How many letters are in the Greek alphabet?", order: 2 },
      { prompt: "Updated baseball roster", order: 3 },
    ]);

  const firstQuestionCard = page.locator("article").filter({
    hasText: "Question 1",
  });
  await firstQuestionCard.getByRole("button", { name: "Delete question" }).click();

  await expect.poll(() => getQuestionsForGame(gameId!)).toHaveLength(2);
  questions = await getQuestionsForGame(gameId!);
  expect(questions.map((question) => question.order)).toEqual([1, 2]);
  expect(questions.map((question) => question.prompt)).toEqual([
    "How many letters are in the Greek alphabet?",
    "Updated baseball roster",
  ]);
});

test("admin can bulk upload valid spreadsheets and sees invalid or empty upload errors", async ({
  page,
}) => {
  await ensureUser({
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Milestone 6 Upload ${Date.now()}`,
  });

  await signInWithSession(page, {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
  });

  await page.goto(`/admin/games/${game.id}`);

  await page.getByLabel("Excel file").setInputFiles(
    path.join(process.cwd(), "e2e/fixtures/questions-valid.csv")
  );
  await page.getByRole("button", { name: "Upload spreadsheet" }).click();
  await expect(page.getByText("Uploaded 2 questions.")).toBeVisible();

  await expect.poll(() => getQuestionsForGame(game.id)).toHaveLength(2);

  await page.getByLabel("Excel file").setInputFiles(
    path.join(process.cwd(), "e2e/fixtures/questions-invalid.csv")
  );
  await page.getByRole("button", { name: "Upload spreadsheet" }).click();
  await expect(page.getByText(/Row 2 is invalid/)).toBeVisible();

  await page.getByLabel("Excel file").setInputFiles(
    path.join(process.cwd(), "e2e/fixtures/questions-empty.csv")
  );
  await page.getByRole("button", { name: "Upload spreadsheet" }).click();
  await expect(page.getByText("The spreadsheet is empty.")).toBeVisible();
});

test("non-admin users are redirected away from admin question management", async ({
  page,
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

  const game = await createGameForAdmin({
    adminEmail: "admin@closestwins.com",
    title: `Milestone 6 Guard ${Date.now()}`,
  });

  await prisma.question.create({
    data: {
      gameId: game.id,
      prompt: "Protected question",
      correctAnswer: 1,
      explanation: "Players should not edit this.",
      order: 1,
    },
  });

  await signInWithSession(page, {
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
  });

  await page.goto(`/admin/games/${game.id}`);
  await page.waitForURL("/player");

  await expect(
    page.getByRole("heading", {
      name: "Create your team and head into the game.",
    })
  ).toBeVisible();
});
