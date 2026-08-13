export type PlayerActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialPlayerActionState: PlayerActionState = {
  status: "idle",
};

const TEAM_NAME_MAX_LENGTH = 40;

function normalizeValue(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

export function validateCreateTeamInput(formData: FormData) {
  const joinCode = normalizeValue(formData, "joinCode").toUpperCase();
  const teamName = normalizeValue(formData, "teamName");
  const fieldErrors: Record<string, string[]> = {};

  if (joinCode.length !== 6) {
    fieldErrors.joinCode = ["Enter the 6-character game join code."];
  }

  if (teamName.length < 2) {
    fieldErrors.teamName = ["Enter a team name with at least 2 characters."];
  }

  if (teamName.length > TEAM_NAME_MAX_LENGTH) {
    fieldErrors.teamName = [
      `Keep the team name under ${TEAM_NAME_MAX_LENGTH} characters.`,
    ];
  }

  return {
    joinCode,
    teamName,
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
