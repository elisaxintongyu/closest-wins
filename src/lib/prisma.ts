import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getModelFieldNames(client: PrismaClient, modelName: string) {
  const runtimeModel = (
    client as PrismaClient & {
      _runtimeDataModel?: {
        models?: Record<
          string,
          {
            fields?: Array<{ name: string }>;
          }
        >;
      };
    }
  )._runtimeDataModel?.models?.[modelName];

  return new Set(runtimeModel?.fields?.map((field) => field.name) ?? []);
}

function hasGameplayDelegates(client: PrismaClient) {
  if (
    !("team" in client) ||
    !("teamMembership" in client) ||
    !("guess" in client)
  ) {
    return false;
  }

  // During local dev, Next.js can hold onto an older generated Prisma client
  // across reloads. Require the gameplay relations we depend on before reusing it.
  const questionFields = getModelFieldNames(client, "Question");
  const guessFields = getModelFieldNames(client, "Guess");

  return (
    questionFields.has("guesses") &&
    guessFields.has("question") &&
    guessFields.has("team")
  );
}

const existingPrisma =
  globalForPrisma.prisma && hasGameplayDelegates(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : undefined;

export const prisma = existingPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
