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

const TEST_EMAILS = new Set([
  "admin@closestwins.com",
  "player@closestwins.com",
  "user@closestwins.com",
  "player.one@closestwins.com",
  "player.two@closestwins.com",
  "admin.one@closestwins.com",
  "admin.two@closestwins.com",
  "empty-admin@closestwins.com",
  "empty-player@closestwins.com",
  "other-player@closestwins.com",
  "captain@closestwins.com",
  "teammate@closestwins.com",
  "late-player@closestwins.com",
]);

const TEST_EMAIL_PREFIXES = ["player+", "empty-admin+"];

const TEST_GAME_TITLE_PREFIXES = [
  "Milestone 6 ",
  "Single round flow ",
  "Multi round flow ",
  "Game control flow ",
  "Auth game one ",
  "Auth game two ",
  "Foreign admin game ",
  "Empty admin game ",
  "Duplicate team game ",
  "Preset team game ",
  "Player error states ",
];

const TEST_GAME_TITLES = new Set([
  "Closest Wins Demo Game (10 Questions)",
  "HackNight Round 1",
  "Hacknight Round 1",
]);

function isTestEmail(email: string) {
  const normalizedEmail = email.toLowerCase();

  return (
    TEST_EMAILS.has(normalizedEmail) ||
    TEST_EMAIL_PREFIXES.some((prefix) => normalizedEmail.startsWith(prefix))
  );
}

function isTestGameTitle(title: string) {
  return (
    TEST_GAME_TITLES.has(title) ||
    TEST_GAME_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix))
  );
}

export async function cleanupE2ETestData() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
  });
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  const userIdsToDelete = users
    .filter((user) => isTestEmail(user.email))
    .map((user) => user.id);
  const gameIdsToDelete = games
    .filter((game) => isTestGameTitle(game.title))
    .map((game) => game.id);

  await prisma.$transaction([
    prisma.game.deleteMany({
      where: {
        id: {
          in: gameIdsToDelete,
        },
      },
    }),
    prisma.user.deleteMany({
      where: {
        id: {
          in: userIdsToDelete,
        },
      },
    }),
  ]);

  return {
    deletedGames: gameIdsToDelete.length,
    deletedUsers: userIdsToDelete.length,
  };
}

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

export async function createPresetTeamForGame(input: {
  gameId: string;
  teamName: string;
}) {
  return prisma.team.create({
    data: {
      gameId: input.gameId,
      name: input.teamName,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function createTeamForPlayer(input: {
  gameId: string;
  userEmail: string;
  teamName: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: input.userEmail.toLowerCase() },
    select: { id: true },
  });

  return prisma.team.create({
    data: {
      gameId: input.gameId,
      captainId: user.id,
      name: input.teamName,
      memberships: {
        create: {
          gameId: input.gameId,
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function addPlayerToTeam(input: {
  gameId: string;
  teamId: string;
  userEmail: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: input.userEmail.toLowerCase() },
    select: { id: true },
  });

  return prisma.teamMembership.create({
    data: {
      gameId: input.gameId,
      teamId: input.teamId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });
}
