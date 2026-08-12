import { createQuestion } from "@/app/admin/actions";

export function CreateQuestionForm({ gameId }: { gameId: string }) {
  const createQuestionForGame = createQuestion.bind(null, gameId);

  return (
    <form
      action={createQuestionForGame}
      className="space-y-4 rounded-2xl border p-4"
    >
      <div className="space-y-2">
        <label
          htmlFor="question-prompt"
          className="text-sm font-medium text-stone-900"
        >
          Prompt
        </label>
        <textarea
          id="question-prompt"
          name="prompt"
          rows={4}
          className="w-full rounded-lg border px-3 py-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="question-answer"
          className="text-sm font-medium text-stone-900"
        >
          Correct answer
        </label>
        <input
          id="question-answer"
          name="correctAnswer"
          type="number"
          step="any"
          className="w-full rounded-lg border px-3 py-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="question-explanation"
          className="text-sm font-medium text-stone-900"
        >
          Explanation
        </label>
        <textarea
          id="question-explanation"
          name="explanation"
          rows={3}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
      >
        Add question
      </button>
    </form>
  );
}
