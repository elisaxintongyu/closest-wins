import { cleanupE2ETestData, prisma } from "../e2e/helpers/db";

async function main() {
  const summary = await cleanupE2ETestData();
  console.log(
    JSON.stringify(
      {
        message: "Cleaned test data from the local development database.",
        ...summary,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Failed to clean test data.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
