import { cleanupE2ETestData, prisma } from "./db";

export default async function globalTeardown() {
  await cleanupE2ETestData();
  await prisma.$disconnect();
}
