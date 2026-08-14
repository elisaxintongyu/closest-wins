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
