import { PrismaClient, type Role } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const globalForE2EPrisma = globalThis as typeof globalThis & {
  e2ePrisma?: PrismaClient;
};

const prisma = globalForE2EPrisma.e2ePrisma ?? new PrismaClient();

if (!globalForE2EPrisma.e2ePrisma) {
  globalForE2EPrisma.e2ePrisma = prisma;
}

export { prisma };

export async function ensureUser(input: {
  email: string;
  name: string;
  role: Role;
}) {
  return prisma.user.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      name: input.name,
      role: input.role,
    },
    create: {
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

function createJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from({ length: 6 }, () => {
    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
  }).join("");
}

export async function createGameForAdmin(input: {
  adminEmail: string;
  title: string;
}) {
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: input.adminEmail.toLowerCase() },
    select: { id: true },
  });

  return prisma.game.create({
    data: {
      title: input.title,
      createdById: admin.id,
      joinCode: createJoinCode(),
    },
    select: {
      id: true,
      title: true,
      joinCode: true,
      createdById: true,
    },
  });
}

export async function getQuestionsForGame(gameId: string) {
  return prisma.question.findMany({
    where: { gameId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      prompt: true,
      correctAnswer: true,
      explanation: true,
      order: true,
      status: true,
    },
  });
}

export async function addQuestionsToGame(
  gameId: string,
  questions: Array<{
    prompt: string;
    correctAnswer: number;
    explanation: string;
  }>
) {
  await prisma.question.createMany({
    data: questions.map((question, index) => ({
      gameId,
      prompt: question.prompt,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      order: index + 1,
    })),
  });
}
