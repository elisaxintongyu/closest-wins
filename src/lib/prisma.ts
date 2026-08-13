import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function hasMilestoneFourDelegates(client: PrismaClient) {
  return "team" in client && "teamMembership" in client;
}

const existingPrisma =
  globalForPrisma.prisma &&
  hasMilestoneFourDelegates(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : undefined;

export const prisma =
  existingPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
