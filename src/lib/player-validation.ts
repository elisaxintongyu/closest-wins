export type PlayerActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialPlayerActionState: PlayerActionState = {
  status: "idle",
};

function normalizeValue(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

export function validateCreateTeamInput(formData: FormData) {
  const joinCode = normalizeValue(formData, "joinCode").toUpperCase();
  const teamId = normalizeValue(formData, "teamId");
  const fieldErrors: Record<string, string[]> = {};

  if (joinCode.length !== 6) {
    fieldErrors.joinCode = ["Enter the 6-character game join code."];
  }

  if (!teamId) {
    fieldErrors.teamId = ["Choose one of the host's preset teams."];
  }

  return {
    joinCode,
    teamId,
    fieldErrors,
  };
}

export function validateGuessInput(formData: FormData) {
  const guessInput = normalizeValue(formData, "guess");
  const guess = Number(guessInput);
  const fieldErrors: Record<string, string[]> = {};

  if (!guessInput) {
    fieldErrors.guess = ["Enter your team's numerical guess."];
  } else if (!Number.isFinite(guess)) {
    fieldErrors.guess = ["Guess must be a valid number."];
  }

  return {
    guess,
    fieldErrors,
  };
}
