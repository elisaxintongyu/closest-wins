"use client";

import { useActionState } from "react";
import { submitGuess } from "@/app/player/actions";
import {
  PlayerFieldErrors,
  PlayerFormMessage,
} from "@/components/player/form-feedback";
import { initialPlayerActionState } from "@/lib/player-validation";

type SubmitGuessFormProps = {
  gameId: string;
  questionId: string;
};

export function SubmitGuessForm({ gameId, questionId }: SubmitGuessFormProps) {
  const submitGuessForQuestion = submitGuess.bind(null, gameId, questionId);
  const [state, formAction] = useActionState(
    submitGuessForQuestion,
    initialPlayerActionState
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.75rem] border border-stone-900/10 bg-stone-50 p-5"
    >
      <div className="space-y-2">
        <label
          htmlFor={`guess-${questionId}`}
          className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
        >
          Team guess
        </label>
        <input
          id={`guess-${questionId}`}
          name="guess"
          type="number"
          step="any"
          placeholder="42"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-lg"
        />
        <PlayerFieldErrors state={state} field="guess" />
      </div>

      <PlayerFormMessage state={state} />

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
      >
        Submit guess
      </button>
    </form>
  );
}
