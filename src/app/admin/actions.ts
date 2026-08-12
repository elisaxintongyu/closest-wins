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
