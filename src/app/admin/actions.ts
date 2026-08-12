"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import {
  initialActionState,
  type ActionState,
  validateGameInput,
  validateQuestionInput,
} from "@/lib/admin-validation";
import { prisma } from "@/lib/prisma";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 6;

function createJoinCodeCandidate() {
  return Array.from(randomBytes(JOIN_CODE_LENGTH), (byte) => {
    return JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length];
  }).join("");
}

function hasFieldErrors(fieldErrors: Record<string, string[]>) {
  return Object.keys(fieldErrors).length > 0;
}

function buildErrorState(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

async function requireAdminDatabaseUserId() {
  const session = await requireRole("ADMIN");

  if (!session.databaseUserId) {
    throw new Error("Admin account is not linked to a database user.");
  }

  return session.databaseUserId;
}

async function generateUniqueJoinCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const joinCode = createJoinCodeCandidate();
    const existingGame = await prisma.game.findUnique({
      where: { joinCode },
      select: { id: true },
    });

    if (!existingGame) {
      return joinCode;
    }
  }

  throw new Error("Unable to generate a unique join code.");
}

export async function createGame(
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const { title, fieldErrors } = validateGameInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the game details and try again.",
      fieldErrors
    );
  }

  const createdById = await requireAdminDatabaseUserId();
  const joinCode = await generateUniqueJoinCode();

  await prisma.game.create({
    data: {
      title,
      joinCode,
      createdById,
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

async function requireOwnedGame(gameId: string, createdById: string) {
  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      createdById,
    },
    select: {
      id: true,
    },
  });

  if (!game) {
    throw new Error("Game not found.");
  }

  return game;
}

async function requireOwnedQuestion(questionId: string, createdById: string) {
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      game: {
        createdById,
      },
    },
    select: {
      id: true,
      order: true,
      gameId: true,
    },
  });

  if (!question) {
    throw new Error("Question not found.");
  }

  return question;
}

export async function createQuestion(
  gameId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  await requireOwnedGame(gameId, createdById);

  const { prompt, explanation, correctAnswer, fieldErrors } =
    validateQuestionInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the question details and try again.",
      fieldErrors
    );
  }

  const orderAggregate = await prisma.question.aggregate({
    where: { gameId },
    _max: { order: true },
  });

  await prisma.question.create({
    data: {
      gameId,
      prompt,
      correctAnswer,
      explanation,
      order: (orderAggregate._max.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/games/${gameId}`);

  return {
    status: "success",
    message: "Question created.",
  };
}

export async function updateQuestion(
  questionId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireOwnedQuestion(questionId, createdById);

  const { prompt, explanation, correctAnswer, fieldErrors } =
    validateQuestionInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the question details and try again.",
      fieldErrors
    );
  }

  await prisma.question.update({
    where: { id: question.id },
    data: {
      prompt,
      correctAnswer,
      explanation,
    },
  });

  revalidatePath(`/admin/games/${question.gameId}`);

  return {
    status: "success",
    message: "Question saved.",
  };
}

export async function deleteQuestion(questionId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireOwnedQuestion(questionId, createdById);

  await prisma.$transaction(async (tx) => {
    await tx.question.delete({
      where: { id: question.id },
    });

    await tx.question.updateMany({
      where: {
        gameId: question.gameId,
        order: {
          gt: question.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });
  });

  revalidatePath(`/admin/games/${question.gameId}`);
}

async function moveQuestion(questionId: string, direction: "up" | "down") {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireOwnedQuestion(questionId, createdById);
  const targetOrder =
    direction === "up" ? question.order - 1 : question.order + 1;

  if (targetOrder < 1) {
    return;
  }

  const swapQuestion = await prisma.question.findFirst({
    where: {
      gameId: question.gameId,
      order: targetOrder,
    },
    select: {
      id: true,
      order: true,
    },
  });

  if (!swapQuestion) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: question.id },
      data: { order: 0 },
    });

    await tx.question.update({
      where: { id: swapQuestion.id },
      data: { order: question.order },
    });

    await tx.question.update({
      where: { id: question.id },
      data: { order: swapQuestion.order },
    });
  });

  revalidatePath(`/admin/games/${question.gameId}`);
}

export async function moveQuestionUp(questionId: string) {
  await moveQuestion(questionId, "up");
}

export async function moveQuestionDown(questionId: string) {
  await moveQuestion(questionId, "down");
}
