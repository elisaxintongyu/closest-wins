import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@closestwins.com";
const GAME_TITLE = "Closest Wins Demo Game (10 Questions)";
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 6;

const DEMO_QUESTIONS = [
  {
    prompt: "How many minutes are in a week?",
    correctAnswer: 10080,
    explanation:
      "A week has 7 days, each day has 24 hours, and each hour has 60 minutes.",
  },
  {
    prompt: "What is the average distance from Earth to the Moon in miles?",
    correctAnswer: 238855,
    explanation: "The average lunar distance is about 238,855 miles.",
  },
  {
    prompt: "How many bones are in an adult human body?",
    correctAnswer: 206,
    explanation:
      "Most adults have 206 bones after some fuse together during growth.",
  },
  {
    prompt: "What year was the first iPhone released?",
    correctAnswer: 2007,
    explanation: "Apple released the first iPhone in June 2007.",
  },
  {
    prompt:
      "How many players are on the field for one soccer team during play?",
    correctAnswer: 11,
    explanation:
      "A soccer team fields 11 players at a time, including the goalkeeper.",
  },
  {
    prompt: "How many ounces are in a U.S. gallon?",
    correctAnswer: 128,
    explanation: "A U.S. liquid gallon contains 128 fluid ounces.",
  },
  {
    prompt: "How many keys are on a standard modern piano?",
    correctAnswer: 88,
    explanation: "A full-size piano typically has 88 keys.",
  },
  {
    prompt: "What is the freezing point of water in Fahrenheit?",
    correctAnswer: 32,
    explanation:
      "Water freezes at 32 degrees Fahrenheit under standard atmospheric pressure.",
  },
  {
    prompt: "How many feet tall is a regulation basketball hoop?",
    correctAnswer: 10,
    explanation:
      "The rim of a regulation basketball hoop is 10 feet above the floor.",
  },
  {
    prompt: "How many days are in a leap year?",
    correctAnswer: 366,
    explanation: "Leap years add February 29, bringing the total to 366 days.",
  },
];

function createJoinCodeCandidate() {
  return Array.from({ length: JOIN_CODE_LENGTH }, () => {
    const index = Math.floor(Math.random() * JOIN_CODE_ALPHABET.length);
    return JOIN_CODE_ALPHABET[index];
  }).join("");
}

async function createUniqueJoinCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const joinCode = createJoinCodeCandidate();
    const existingGame = await prisma.game.findUnique({
      where: { joinCode },
      select: { id: true },
    });

    if (!existingGame) {
      return joinCode;
    }
  }

  throw new Error("Unable to generate a unique join code for the demo game.");
}

async function main() {
  const label = process.argv[2]?.trim() || "database";
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      name: "Closest Wins Admin",
    },
    create: {
      email: ADMIN_EMAIL,
      role: "ADMIN",
      name: "Closest Wins Admin",
    },
    select: {
      id: true,
      email: true,
    },
  });

  const existingGame = await prisma.game.findFirst({
    where: {
      title: GAME_TITLE,
      createdById: adminUser.id,
    },
    select: {
      id: true,
      joinCode: true,
      questions: {
        select: {
          id: true,
        },
      },
    },
  });

  const joinCode = existingGame?.joinCode ?? (await createUniqueJoinCode());

  const game = await prisma.$transaction(async (tx) => {
    const seededGame = existingGame
      ? await tx.game.update({
          where: { id: existingGame.id },
          data: {
            status: "DRAFT",
            joinCode,
          },
          select: {
            id: true,
            joinCode: true,
            title: true,
          },
        })
      : await tx.game.create({
          data: {
            title: GAME_TITLE,
            joinCode,
            status: "DRAFT",
            createdById: adminUser.id,
          },
          select: {
            id: true,
            joinCode: true,
            title: true,
          },
        });

    await tx.question.deleteMany({
      where: {
        gameId: seededGame.id,
      },
    });

    await tx.question.createMany({
      data: DEMO_QUESTIONS.map((question, index) => ({
        gameId: seededGame.id,
        prompt: question.prompt,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        order: index + 1,
        status: "HIDDEN",
      })),
    });

    return seededGame;
  });

  console.log(
    JSON.stringify(
      {
        message: `Seeded demo game into ${label}.`,
        game: {
          id: game.id,
          title: game.title,
          joinCode: game.joinCode,
          questionCount: DEMO_QUESTIONS.length,
        },
        adminUser,
      },
      null,
      2
    )
  );
}

main()
  .catch(async (error) => {
    console.error("Failed to seed demo game.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
