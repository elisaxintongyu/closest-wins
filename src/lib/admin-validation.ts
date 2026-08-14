export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = {
  status: "idle",
};

const GAME_TITLE_MAX_LENGTH = 100;
const QUESTION_PROMPT_MAX_LENGTH = 500;
const QUESTION_EXPLANATION_MAX_LENGTH = 2000;
const TEAM_NAME_MAX_LENGTH = 40;

function getTrimmedString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function pushFieldError(
  fieldErrors: Record<string, string[]>,
  field: string,
  message: string
) {
  fieldErrors[field] ??= [];
  fieldErrors[field].push(message);
}

export function validateGameInput(formData: FormData) {
  const title = getTrimmedString(formData.get("title"));
  const fieldErrors: Record<string, string[]> = {};

  if (!title) {
    pushFieldError(fieldErrors, "title", "Game title is required.");
  } else if (title.length > GAME_TITLE_MAX_LENGTH) {
    pushFieldError(
      fieldErrors,
      "title",
      `Game title must be ${GAME_TITLE_MAX_LENGTH} characters or fewer.`
    );
  }

  return {
    title,
    fieldErrors,
  };
}

export function validateQuestionValues(
  promptInput: string,
  explanationInput: string,
  answerInput: string
) {
  const prompt = promptInput.trim();
  const explanation = explanationInput.trim();
  const fieldErrors: Record<string, string[]> = {};

  if (!prompt) {
    pushFieldError(fieldErrors, "prompt", "Question prompt is required.");
  } else if (prompt.length > QUESTION_PROMPT_MAX_LENGTH) {
    pushFieldError(
      fieldErrors,
      "prompt",
      `Question prompt must be ${QUESTION_PROMPT_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!answerInput) {
    pushFieldError(
      fieldErrors,
      "correctAnswer",
      "A correct numerical answer is required."
    );
  }

  const correctAnswer = Number(answerInput);

  if (answerInput && !Number.isFinite(correctAnswer)) {
    pushFieldError(
      fieldErrors,
      "correctAnswer",
      "Correct answer must be a valid number."
    );
  }

  if (explanation.length > QUESTION_EXPLANATION_MAX_LENGTH) {
    pushFieldError(
      fieldErrors,
      "explanation",
      `Explanation must be ${QUESTION_EXPLANATION_MAX_LENGTH} characters or fewer.`
    );
  }

  return {
    prompt,
    explanation: explanation || null,
    correctAnswer,
    fieldErrors,
  };
}

export function validateQuestionInput(formData: FormData) {
  const promptInput = getTrimmedString(formData.get("prompt"));
  const explanationInput = getTrimmedString(formData.get("explanation"));
  const answerInput = getTrimmedString(formData.get("correctAnswer"));
  return validateQuestionValues(promptInput, explanationInput, answerInput);
}

export function validatePresetTeamInput(formData: FormData) {
  const teamName = getTrimmedString(formData.get("teamName"));
  const fieldErrors: Record<string, string[]> = {};

  if (teamName.length < 2) {
    pushFieldError(
      fieldErrors,
      "teamName",
      "Team name must be at least 2 characters long."
    );
  } else if (teamName.length > TEAM_NAME_MAX_LENGTH) {
    pushFieldError(
      fieldErrors,
      "teamName",
      `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or fewer.`
    );
  }

  return {
    teamName,
    fieldErrors,
  };
}
