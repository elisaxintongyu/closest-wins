"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import {
  findOwnedGame,
  findOwnedQuestion,
  findQuestionWithRoundState,
  requireAdminDatabaseUserId,
} from "@/lib/admin-access";
import {
  initialActionState,
  type ActionState,
  validateGameInput,
  validatePresetTeamInput,
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

export async function createQuestion(
  gameId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  await findOwnedGame(gameId, createdById);

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

export async function createPresetTeam(
  gameId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  await findOwnedGame(gameId, createdById);
  const { teamName, fieldErrors } = validatePresetTeamInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the preset team details and try again.",
      fieldErrors
    );
  }

  const normalizedName = teamName.replace(/\s+/g, " ");
  const existingTeam = await prisma.team.findFirst({
    where: {
      gameId,
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (existingTeam) {
    return buildErrorState("That preset team already exists in this game.", {
      teamName: ["Choose a different preset team name."],
    });
  }

  await prisma.team.create({
    data: {
      gameId,
      name: normalizedName,
    },
  });

  revalidatePath(`/admin/games/${gameId}`);
  revalidatePath("/player");

  return {
    status: "success",
    message: "Preset team created.",
  };
}

export async function bulkUploadQuestions(
  gameId: string,
  previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void previousState;
  const createdById = await requireAdminDatabaseUserId();
  await findOwnedGame(gameId, createdById);

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
  const question = await findOwnedQuestion(questionId, createdById);

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
  const question = await findOwnedQuestion(questionId, createdById);

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
          increment: 1000,
        },
      },
    });

    await tx.question.updateMany({
      where: {
        gameId: question.gameId,
        order: {
          gt: question.order + 1000,
        },
      },
      data: {
        order: {
          decrement: 1001,
        },
      },
    });
  });

  revalidatePath(`/admin/games/${question.gameId}`);
}

export async function deletePresetTeam(teamId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      game: {
        createdById,
      },
    },
    select: {
      id: true,
      gameId: true,
      _count: {
        select: {
          memberships: true,
          guesses: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error("Preset team not found.");
  }

  if (team._count.memberships > 0 || team._count.guesses > 0) {
    throw new Error("Preset team cannot be removed after players join or guess.");
  }

  await prisma.team.delete({
    where: {
      id: team.id,
    },
  });

  revalidatePath(`/admin/games/${team.gameId}`);
  revalidatePath("/player");
}

async function moveQuestion(questionId: string, direction: "up" | "down") {
  const createdById = await requireAdminDatabaseUserId();
  const question = await findOwnedQuestion(questionId, createdById);
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
  const question = await findQuestionWithRoundState(
    questionId,
    createdById,
    "HIDDEN"
  );

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
  const question = await findQuestionWithRoundState(
    questionId,
    createdById,
    "OPEN"
  );

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

export async function endGameSession(gameId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const game = await findOwnedGame(gameId, createdById);

  await prisma.game.update({
    where: {
      id: game.id,
    },
    data: {
      status: "COMPLETED",
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/games/${game.id}`);
  revalidatePath(`/player/games/${game.id}`);
  revalidatePath(`/player/lobby/${game.id}`);
}

export async function resetGameSession(gameId: string) {
  const createdById = await requireAdminDatabaseUserId();
  const game = await findOwnedGame(gameId, createdById);

  await prisma.$transaction([
    prisma.guess.deleteMany({
      where: {
        question: {
          gameId: game.id,
        },
      },
    }),
    prisma.question.updateMany({
      where: {
        gameId: game.id,
      },
      data: {
        status: "HIDDEN",
      },
    }),
    prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        status: "DRAFT",
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/admin/games/${game.id}`);
  revalidatePath(`/player/games/${game.id}`);
  revalidatePath(`/player/lobby/${game.id}`);
}
