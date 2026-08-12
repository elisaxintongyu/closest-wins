"use client";

import { useActionState } from "react";
import { deleteQuestion, updateQuestion } from "@/app/admin/actions";
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
};

export function QuestionEditor({ question }: QuestionEditorProps) {
  const updateQuestionById = updateQuestion.bind(null, question.id);
  const deleteQuestionById = deleteQuestion.bind(null, question.id);
  const [state, formAction] = useActionState(
    updateQuestionById,
    initialActionState
  );

  return (
    <article className="space-y-4 rounded-2xl border p-4">
      <div>
        <p className="text-sm font-semibold text-stone-900">
          Question {question.order}
        </p>
        <p className="text-xs text-stone-600">Status: {question.status}</p>
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

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            pendingLabel="Saving..."
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Save changes
          </SubmitButton>

          <button
            type="submit"
            formAction={deleteQuestionById}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
          >
            Delete question
          </button>
        </div>
      </form>
    </article>
  );
}
