"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { requireRole } from "@/lib/auth-guards";
import {
  initialActionState,
  type ActionState,
  validateGameInput,
  validateQuestionInput,
  validateQuestionValues,
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

function normalizeSpreadsheetHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getCellValue(
  row: Record<string, unknown>,
  acceptedHeaders: string[]
): string {
  for (const [key, value] of Object.entries(row)) {
    if (acceptedHeaders.includes(normalizeSpreadsheetHeader(key))) {
      return String(value ?? "").trim();
    }
  }

  return "";
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

async function requireRoundState(
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

export async function bulkUploadQuestions(
  gameId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  await requireOwnedGame(gameId, createdById);

  const upload = formData.get("questionFile");

  if (!(upload instanceof File) || upload.size === 0) {
    return buildErrorState("Choose a spreadsheet file to upload.", {
      questionFile: ["Upload an .xlsx, .xls, or .csv file."],
    });
  }

  let rows: Record<string, unknown>[];

  try {
    const bytes = await upload.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(bytes), { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return buildErrorState("The uploaded file does not contain any sheets.", {
        questionFile: ["Add a sheet with question rows and try again."],
      });
    }

    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[firstSheetName],
      {
        defval: "",
      }
    );
  } catch {
    return buildErrorState("We couldn't read that spreadsheet.", {
      questionFile: ["Use a valid .xlsx, .xls, or .csv file."],
    });
  }

  if (rows.length === 0) {
    return buildErrorState("The spreadsheet is empty.", {
      questionFile: ["Add at least one question row before uploading."],
    });
  }

  const parsedQuestions = rows.map((row, index) => {
    const prompt = getCellValue(row, ["prompt", "question", "questionprompt"]);
    const correctAnswer = getCellValue(row, [
      "correctanswer",
      "answer",
      "correct",
    ]);
    const explanation = getCellValue(row, ["explanation", "notes"]);
    const validation = validateQuestionValues(
      prompt,
      explanation,
      correctAnswer
    );

    return {
      rowNumber: index + 2,
      ...validation,
    };
  });

  const invalidQuestion = parsedQuestions.find(
    (question) => Object.keys(question.fieldErrors).length > 0
  );

  if (invalidQuestion) {
    const firstError = Object.values(invalidQuestion.fieldErrors)[0]?.[0];

    return buildErrorState(
      `Row ${invalidQuestion.rowNumber} is invalid${firstError ? `: ${firstError}` : "."}`,
      {
        questionFile: [
          "Use columns named prompt, correct answer, and explanation.",
        ],
      }
    );
  }

  const orderAggregate = await prisma.question.aggregate({
    where: { gameId },
    _max: { order: true },
  });
  const startingOrder = (orderAggregate._max.order ?? 0) + 1;

  await prisma.question.createMany({
    data: parsedQuestions.map((question, index) => ({
      gameId,
      prompt: question.prompt,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      order: startingOrder + index,
    })),
  });

  revalidatePath(`/admin/games/${gameId}`);

  return {
    status: "success",
    message: `Uploaded ${parsedQuestions.length} question${parsedQuestions.length === 1 ? "" : "s"}.`,
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

export async function openQuestionRound(questionId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireRoundState(questionId, createdById, "HIDDEN");

  const existingOpenQuestion = await prisma.question.findFirst({
    where: {
      gameId: question.gameId,
      status: "OPEN",
    },
    select: {
      id: true,
    },
  });

  if (existingOpenQuestion) {
    throw new Error("Close the current open round before opening another one.");
  }

  await prisma.$transaction([
    prisma.game.update({
      where: {
        id: question.gameId,
      },
      data: {
        status: "IN_PROGRESS",
      },
    }),
    prisma.question.update({
      where: {
        id: question.id,
      },
      data: {
        status: "OPEN",
      },
    }),
  ]);

  revalidatePath(`/admin/games/${question.gameId}`);
  revalidatePath(`/player/games/${question.gameId}`);
  revalidatePath(`/player/lobby/${question.gameId}`);
}

export async function closeQuestionRound(questionId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await requireRoundState(questionId, createdById, "OPEN");

  await prisma.question.update({
    where: {
      id: question.id,
    },
    data: {
      status: "CLOSED",
    },
  });

  revalidatePath(`/admin/games/${question.gameId}`);
  revalidatePath(`/player/games/${question.gameId}`);
  revalidatePath(`/player/lobby/${question.gameId}`);
}

export async function revealQuestionRound(questionId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      status: "CLOSED",
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
    throw new Error("Question is not ready to reveal.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: {
        id: question.id,
      },
      data: {
        status: "REVEALED",
      },
    });

    const remainingRounds = await tx.question.count({
      where: {
        gameId: question.gameId,
        status: {
          in: ["HIDDEN", "OPEN", "CLOSED"],
        },
      },
    });

    if (remainingRounds === 0) {
      await tx.game.update({
        where: {
          id: question.gameId,
        },
        data: {
          status: "COMPLETED",
        },
      });
    }
  });

  revalidatePath(`/admin/games/${question.gameId}`);
  revalidatePath(`/player/games/${question.gameId}`);
  revalidatePath(`/player/lobby/${question.gameId}`);
}
