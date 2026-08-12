import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emailInput = process.argv[2]?.trim().toLowerCase();

  if (!emailInput) {
    throw new Error("Usage: npm run db:make-admin -- <email>");
  }

  const user = await prisma.user.upsert({
    where: { email: emailInput },
    update: {
      role: "ADMIN",
    },
    create: {
      email: emailInput,
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        message: "User is now configured as an admin.",
        user,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(async (error) => {
    console.error("Failed to configure admin user.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
