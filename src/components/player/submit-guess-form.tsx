"use client";

// Renders the player form for submitting a single round guess.

import { useActionState } from "react";
import { submitGuess } from "@/app/player/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  PlayerFieldErrors,
  PlayerFormMessage,
} from "@/components/player/form-feedback";
import { initialPlayerActionState } from "@/lib/player-validation";

type SubmitGuessFormProps = {
  gameId: string;
  questionId: string;
  existingGuess: number | null;
};

export function SubmitGuessForm({
  gameId,
  questionId,
  existingGuess,
}: SubmitGuessFormProps) {
  const submitGuessForQuestion = submitGuess.bind(null, gameId, questionId);
  const [state, formAction] = useActionState(
    submitGuessForQuestion,
    initialPlayerActionState
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.75rem] border border-stone-900/10 bg-stone-50 p-5 sm:p-6"
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
          disabled={existingGuess !== null}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-lg"
        />
        <PlayerFieldErrors state={state} field="guess" />
      </div>

      {existingGuess !== null ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your team locked in{" "}
          <span className="font-semibold">{existingGuess}</span> for this round.
        </p>
      ) : null}

      <PlayerFormMessage state={state} />

      <SubmitButton
        pendingLabel="Submitting guess..."
        disabled={existingGuess !== null}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        style={{ color: "#fff" }}
      >
        {existingGuess !== null ? "Guess submitted" : "Submit guess"}
      </SubmitButton>
    </form>
  );
}
