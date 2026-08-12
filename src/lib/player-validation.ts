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
  const teamName = normalizeValue(formData, "teamName");
  const fieldErrors: Record<string, string[]> = {};

  if (joinCode.length !== 6) {
    fieldErrors.joinCode = ["Enter the 6-character game join code."];
  }

  if (teamName.length < 2) {
    fieldErrors.teamName = ["Enter a team name with at least 2 characters."];
  }

  if (teamName.length > 40) {
    fieldErrors.teamName = ["Keep the team name under 40 characters."];
  }

  return {
    joinCode,
    teamName,
    fieldErrors,
  };
}
