import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function requirePlayerDatabaseUser() {
  const session = await requireRole("PLAYER");
  return syncDatabaseUser(session);
}

export async function findPlayerMembership(gameId: string, userId: string) {
  const membership = await prisma.teamMembership.findUnique({
    where: {
      gameId_userId: {
        gameId,
        userId,
      },
    },
    select: {
      gameId: true,
      teamId: true,
      team: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("You are not part of this game.");
  }

  return membership;
}
