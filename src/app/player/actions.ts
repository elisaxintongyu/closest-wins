"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  initialPlayerActionState,
  type PlayerActionState,
  validateCreateTeamInput,
} from "@/lib/player-validation";

function hasFieldErrors(fieldErrors: Record<string, string[]>) {
  return Object.keys(fieldErrors).length > 0;
}

function buildErrorState(
  message: string,
  fieldErrors?: Record<string, string[]>
): PlayerActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

async function requirePlayerDatabaseUser() {
  const session = await requireRole("PLAYER");
  return syncDatabaseUser(session);
}

export async function createTeam(
  previousState: PlayerActionState = initialPlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  void previousState;
  const { joinCode, teamName, fieldErrors } = validateCreateTeamInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the team details and try again.",
      fieldErrors
    );
  }

  const player = await requirePlayerDatabaseUser();
  const normalizedName = teamName.replace(/\s+/g, " ");

  const game = await prisma.game.findUnique({
    where: {
      joinCode,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  if (!game) {
    return buildErrorState("We couldn't find a game with that join code.", {
      joinCode: ["Check the code and try again."],
    });
  }

  const existingMembership = await prisma.teamMembership.findUnique({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId: player.id,
      },
    },
    select: {
      team: {
        select: {
          id: true,
        },
      },
    },
  });

  if (existingMembership) {
    redirect(`/player/games/${game.id}`);
  }

  const existingTeam = await prisma.team.findFirst({
    where: {
      gameId: game.id,
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (existingTeam) {
    return buildErrorState("That team name is already taken in this game.", {
      teamName: ["Choose a different team name."],
    });
  }

  const team = await prisma.$transaction(async (tx) => {
    return tx.team.create({
      data: {
        gameId: game.id,
        captainId: player.id,
        name: normalizedName,
        memberships: {
          create: {
            gameId: game.id,
            userId: player.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  });

  revalidatePath("/player");
  redirect(`/player/games/${game.id}?team=${team.id}`);
}
