"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 6;

function createJoinCodeCandidate() {
  return Array.from(randomBytes(JOIN_CODE_LENGTH), (byte) => {
    return JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length];
  }).join("");
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

export async function createGame(formData: FormData) {
  const titleValue = formData.get("title");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";

  if (!title) {
    throw new Error("Game title is required.");
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
      gameId: true,
    },
  });

  if (!question) {
    throw new Error("Question not found.");
  }

  return question;
}

export async function createQuestion(gameId: string, formData: FormData) {
  const createdById = await requireAdminDatabaseUserId();
  await requireOwnedGame(gameId, createdById);

  const promptValue = formData.get("prompt");
  const answerValue = formData.get("correctAnswer");
  const explanationValue = formData.get("explanation");
  const prompt = typeof promptValue === "string" ? promptValue.trim() : "";
  const explanation =
    typeof explanationValue === "string" ? explanationValue.trim() : "";
  const correctAnswer =
    typeof answerValue === "string" ? Number(answerValue) : Number.NaN;

  if (!prompt || !Number.isFinite(correctAnswer)) {
    throw new Error("Question prompt and numerical answer are required.");
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
      explanation: explanation || null,
      order: (orderAggregate._max.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/games/${gameId}`);
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireOwnedQuestion(questionId, createdById);

  const promptValue = formData.get("prompt");
  const answerValue = formData.get("correctAnswer");
  const explanationValue = formData.get("explanation");
  const prompt = typeof promptValue === "string" ? promptValue.trim() : "";
  const explanation =
    typeof explanationValue === "string" ? explanationValue.trim() : "";
  const correctAnswer =
    typeof answerValue === "string" ? Number(answerValue) : Number.NaN;

  if (!prompt || !Number.isFinite(correctAnswer)) {
    throw new Error("Question prompt and numerical answer are required.");
  }

  await prisma.question.update({
    where: { id: question.id },
    data: {
      prompt,
      correctAnswer,
      explanation: explanation || null,
    },
  });

  revalidatePath(`/admin/games/${question.gameId}`);
}

export async function deleteQuestion(questionId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireOwnedQuestion(questionId, createdById);

  await prisma.question.delete({
    where: { id: question.id },
  });

  revalidatePath(`/admin/games/${question.gameId}`);
}
