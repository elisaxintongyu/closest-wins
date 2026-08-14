import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function requireAdminDatabaseUserId() {
  const session = await requireRole("ADMIN");

  if (!session.databaseUserId) {
    throw new Error("Admin account is not linked to a database user.");
  }

  return session.databaseUserId;
}

export async function findOwnedGame(gameId: string, createdById: string) {
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

export async function findOwnedQuestion(
  questionId: string,
  createdById: string
) {
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

export async function findQuestionWithRoundState(
  questionId: string,
  createdById: string,
  expectedStatus: "HIDDEN" | "OPEN"
) {
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
      order: true,
      status: true,
    },
  });

  if (!question) {
    throw new Error("Question not found.");
  }

  if (question.status !== expectedStatus) {
    throw new Error(`Question is not ${expectedStatus.toLowerCase()}.`);
  }

  return question;
}
