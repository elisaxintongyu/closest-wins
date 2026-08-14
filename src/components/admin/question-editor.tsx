"use client";

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
  };
  canMoveUp: boolean;
  canMoveDown: boolean;
  canOpenRound: boolean;
  canCloseRound: boolean;
  canRevealRound: boolean;
};

export function QuestionEditor({
  question,
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
            <button
              type="submit"
              disabled={!canOpenRound}
              className="min-h-11 w-full rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-800 disabled:opacity-50 sm:w-auto"
            >
              Open round
            </button>
          </form>
          <form action={closeQuestionRoundById}>
            <button
              type="submit"
              disabled={!canCloseRound}
              className="min-h-11 w-full rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-800 disabled:opacity-50 sm:w-auto"
            >
              Close round
            </button>
          </form>
          <form action={revealQuestionRoundById}>
            <button
              type="submit"
              disabled={!canRevealRound}
              className="min-h-11 w-full rounded-lg border border-sky-300 px-3 py-2 text-sm text-sky-800 disabled:opacity-50 sm:w-auto"
            >
              Reveal answer
            </button>
          </form>
          <form action={moveQuestionUpById}>
            <button
              type="submit"
              disabled={!canMoveUp}
              className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 sm:w-auto"
            >
              Move up
            </button>
          </form>
          <form action={moveQuestionDownById}>
            <button
              type="submit"
              disabled={!canMoveDown}
              className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 sm:w-auto"
            >
              Move down
            </button>
          </form>
        </div>
      </div>

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

          <button
            type="submit"
            formAction={deleteQuestionById}
            className="min-h-11 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 sm:w-auto"
          >
            Delete question
          </button>
        </div>
      </form>
    </article>
  );
}
