import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedUsers = [
  {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    password: "Admin123!",
    role: "ADMIN" as const,
  },
  {
    email: "user@closestwins.com",
    name: "Demo User",
    password: "Player123!",
    role: "PLAYER" as const,
  },
];

async function main() {
  for (const user of seedUsers) {
    const passwordHash = await hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seeding failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
