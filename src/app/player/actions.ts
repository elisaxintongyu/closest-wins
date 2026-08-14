"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  findPlayerMembership,
  requirePlayerDatabaseUser,
} from "@/lib/player-access";
import { prisma } from "@/lib/prisma";
import {
  initialPlayerActionState,
  type PlayerActionState,
  validateCreateTeamInput,
  validateGuessInput,
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

export async function createTeam(
  previousState: PlayerActionState = initialPlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  void previousState;
  const { joinCode, teamId, fieldErrors } = validateCreateTeamInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Please fix the team details and try again.",
      fieldErrors
    );
  }

  const player = await requirePlayerDatabaseUser();

  const game = await prisma.game.findUnique({
    where: {
      joinCode,
    },
    select: {
      id: true,
      title: true,
      status: true,
      teams: {
        where: {
          id: teamId,
        },
        select: {
          id: true,
          name: true,
          captainId: true,
        },
        take: 1,
      },
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
    redirect(`/player/games/${game.id}?status=already-joined`);
  }

  const selectedTeam = game.teams[0];

  if (!selectedTeam) {
    return buildErrorState("Choose one of the preset teams for this game.", {
      teamId: ["Pick a valid preset team before joining."],
    });
  }

  const team = await prisma.$transaction(async (tx) => {
    await tx.teamMembership.create({
      data: {
        gameId: game.id,
        teamId: selectedTeam.id,
        userId: player.id,
      },
    });

    if (!selectedTeam.captainId) {
      await tx.team.update({
        where: {
          id: selectedTeam.id,
        },
        data: {
          captainId: player.id,
        },
      });
    }

    return tx.team.findUniqueOrThrow({
      where: {
        id: selectedTeam.id,
      },
      select: {
        id: true,
      },
    });
  });

  revalidatePath("/player");
  redirect(`/player/games/${game.id}?team=${team.id}`);
}

export async function submitGuess(
  gameId: string,
  questionId: string,
  previousState: PlayerActionState = initialPlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  void previousState;
  const { guess, fieldErrors } = validateGuessInput(formData);

  if (hasFieldErrors(fieldErrors)) {
    return buildErrorState(
      "Enter a valid numerical guess to submit.",
      fieldErrors
    );
  }

  const player = await requirePlayerDatabaseUser();
  const membership = await findPlayerMembership(gameId, player.id);

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      gameId,
      status: "OPEN",
    },
    select: {
      id: true,
      order: true,
    },
  });

  if (!question) {
    return buildErrorState("That round is no longer accepting guesses.");
  }

  const existingGuess = await prisma.guess.findUnique({
    where: {
      questionId_teamId: {
        questionId: question.id,
        teamId: membership.teamId,
      },
    },
    select: {
      value: true,
    },
  });

  if (existingGuess) {
    return buildErrorState(
      `Your team already submitted ${existingGuess.value} for this round.`,
      {
        guess: ["Each team gets one guess per round."],
      }
    );
  }

  await prisma.guess.create({
    data: {
      questionId: question.id,
      teamId: membership.teamId,
      userId: player.id,
      value: guess,
    },
  });

  revalidatePath(`/player/games/${gameId}`);
  revalidatePath(`/player/lobby/${gameId}`);

  return {
    status: "success",
    message: `Submitted ${guess} for ${membership.team.name} in round ${question.order}.`,
  };
}
