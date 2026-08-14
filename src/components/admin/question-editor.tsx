"use client";

// Renders the admin editor and round controls for a single question.

import { useActionState } from "react";
import {
  closeQuestionRound,
  deleteQuestion,
  moveQuestionDown,
  moveQuestionUp,
  openQuestionRound,
  revealQuestionRound,
  updateQuestion,
} from "@/app/admin/actions";
import { FieldErrors, FormMessage } from "@/components/admin/form-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialActionState } from "@/lib/admin-validation";

type QuestionEditorProps = {
  question: {
    id: string;
    prompt: string;
    correctAnswer: number;
    explanation: string | null;
    order: number;
    status: string;
    guesses: {
      id: string;
      value: number;
      createdAt: Date;
      team: {
        id: string;
        name: string;
      };
    }[];
  };
  totalTeamCount: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canOpenRound: boolean;
  canCloseRound: boolean;
  canRevealRound: boolean;
};

export function QuestionEditor({
  question,
  totalTeamCount,
  canMoveUp,
  canMoveDown,
  canOpenRound,
  canCloseRound,
  canRevealRound,
}: QuestionEditorProps) {
  const updateQuestionById = updateQuestion.bind(null, question.id);
  const deleteQuestionById = deleteQuestion.bind(null, question.id);
  const moveQuestionUpById = moveQuestionUp.bind(null, question.id);
  const moveQuestionDownById = moveQuestionDown.bind(null, question.id);
  const openQuestionRoundById = openQuestionRound.bind(null, question.id);
  const closeQuestionRoundById = closeQuestionRound.bind(null, question.id);
  const revealQuestionRoundById = revealQuestionRound.bind(null, question.id);
  const [state, formAction] = useActionState(
    updateQuestionById,
    initialActionState
  );
  const submittedCount = question.guesses.length;
  const pendingCount = Math.max(totalTeamCount - submittedCount, 0);

  return (
    <article className="space-y-4 rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900">
            Question {question.order}
          </p>
          <p className="text-xs text-stone-600">Status: {question.status}</p>
        </div>
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <form action={openQuestionRoundById}>
            <SubmitButton
              pendingLabel="Opening..."
              disabled={!canOpenRound}
              className="min-h-11 w-full rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-800 disabled:opacity-50 sm:w-auto"
            >
              Open round
            </SubmitButton>
          </form>
          <form action={closeQuestionRoundById}>
            <SubmitButton
              pendingLabel="Closing..."
              disabled={!canCloseRound}
              className="min-h-11 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-800 disabled:opacity-50 sm:w-auto"
            >
              Close round
            </SubmitButton>
          </form>
          <form action={revealQuestionRoundById}>
            <SubmitButton
              pendingLabel="Revealing..."
              disabled={!canRevealRound}
              className="min-h-11 w-full rounded-lg border border-sky-300 px-3 py-2 text-sm text-sky-800 disabled:opacity-50 sm:w-auto"
            >
              Reveal answer
            </SubmitButton>
          </form>
          <form action={moveQuestionUpById}>
            <SubmitButton
              pendingLabel="Moving..."
              disabled={!canMoveUp}
              className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 sm:w-auto"
            >
              Move up
            </SubmitButton>
          </form>
          <form action={moveQuestionDownById}>
            <SubmitButton
              pendingLabel="Moving..."
              disabled={!canMoveDown}
              className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 sm:w-auto"
            >
              Move down
            </SubmitButton>
          </form>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-stone-950">Submissions</p>
            <p className="text-xs text-stone-600">
              {submittedCount} of {totalTeamCount} team
              {totalTeamCount === 1 ? "" : "s"} submitted
            </p>
          </div>
          {question.status === "OPEN" ? (
            <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">
              {pendingCount === 0
                ? "All teams submitted"
                : `${pendingCount} waiting`}
            </span>
          ) : null}
        </div>

        {submittedCount === 0 ? (
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {question.status === "HIDDEN"
              ? "No submissions yet. Teams can start guessing once you open this round."
              : "No teams have submitted a guess for this round yet."}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {question.guesses.map((guess, index) => (
              <div
                key={guess.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-words text-stone-950">
                    {index + 1}. {guess.team.name}
                  </p>
                  <p className="text-xs text-stone-600">
                    Guess received by the host view.
                  </p>
                </div>
                <p className="text-lg font-semibold text-stone-950">
                  {guess.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={`prompt-${question.id}`}
            className="text-sm font-medium text-stone-900"
          >
            Prompt
          </label>
          <textarea
            id={`prompt-${question.id}`}
            name="prompt"
            rows={4}
            defaultValue={question.prompt}
            className="w-full rounded-lg border px-3 py-2"
          />
          <FieldErrors state={state} field="prompt" />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`correct-answer-${question.id}`}
            className="text-sm font-medium text-stone-900"
          >
            Correct answer
          </label>
          <input
            id={`correct-answer-${question.id}`}
            name="correctAnswer"
            type="number"
            step="any"
            defaultValue={question.correctAnswer}
            className="w-full rounded-lg border px-3 py-2"
          />
          <FieldErrors state={state} field="correctAnswer" />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`explanation-${question.id}`}
            className="text-sm font-medium text-stone-900"
          >
            Explanation
          </label>
          <textarea
            id={`explanation-${question.id}`}
            name="explanation"
            rows={3}
            defaultValue={question.explanation ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
          <FieldErrors state={state} field="explanation" />
        </div>

        <FormMessage state={state} />

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <SubmitButton
            pendingLabel="Saving..."
            className="min-h-11 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
            style={{ color: "#fff" }}
          >
            Save changes
          </SubmitButton>
        </div>
      </form>

      <form action={deleteQuestionById}>
        <SubmitButton
          pendingLabel="Deleting..."
          className="min-h-11 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 sm:w-auto"
        >
          Delete question
        </SubmitButton>
      </form>
    </article>
  );
}
