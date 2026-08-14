import { hash } from "bcryptjs";
import { PrismaClient, type Role } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD_HASH_ROUNDS = 12;

function normalizeRole(roleInput: string | undefined): Role {
  if (!roleInput) {
    return "PLAYER";
  }

  const normalizedRole = roleInput.trim().toUpperCase();

  if (normalizedRole !== "ADMIN" && normalizedRole !== "PLAYER") {
    throw new Error("Role must be either ADMIN or PLAYER.");
  }

  return normalizedRole;
}

async function main() {
  const emailInput = process.argv[2]?.trim().toLowerCase();
  const passwordInput = process.argv[3]?.trim();
  const roleInput = process.argv[4];
  const nameInput = process.argv[5]?.trim();

  if (!emailInput || !passwordInput) {
    throw new Error(
      "Usage: npm run db:seed-user -- <email> <password> [role] [name]"
    );
  }

  const role = normalizeRole(roleInput);
  const passwordHash = await hash(passwordInput, PASSWORD_HASH_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: emailInput },
    update: {
      name: nameInput || null,
      passwordHash,
      role,
    },
    create: {
      email: emailInput,
      name: nameInput || null,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        message: "User has been seeded successfully.",
        user,
      },
      null,
      2
    )
  );
}

main()
  .catch(async (error) => {
    console.error("Failed to seed user.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
