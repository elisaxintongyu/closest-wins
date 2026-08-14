"use client";

// Renders admin controls for ending or resetting a game session.

import { endGameSession, resetGameSession } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";

type GameSessionControlsProps = {
  gameId: string;
  gameStatus: string;
};

export function GameSessionControls({
  gameId,
  gameStatus,
}: GameSessionControlsProps) {
  const endGameSessionById = endGameSession.bind(null, gameId);
  const resetGameSessionById = resetGameSession.bind(null, gameId);
  const canEndGame = gameStatus !== "COMPLETED";

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-stone-950">Game controls</h2>
        <p className="text-sm leading-7 text-stone-700">
          End the current session early or reset the game so the same teams and
          questions can be replayed from the start.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <form
          action={endGameSessionById}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-stone-950">End game</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            Mark this session as completed without changing teams, questions, or
            existing guesses.
          </p>
          <SubmitButton
            pendingLabel="Ending game..."
            disabled={!canEndGame}
            className="mt-4 min-h-11 w-full rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
          >
            {canEndGame ? "End game" : "Game already completed"}
          </SubmitButton>
        </form>

        <form
          action={resetGameSessionById}
          className="rounded-2xl border border-sky-200 bg-sky-50 p-4"
        >
          <p className="text-sm font-semibold text-stone-950">Reset game</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            Clear every guess, hide every round again, and move the session back
            to setup while keeping the existing teams and questions.
          </p>
          <SubmitButton
            pendingLabel="Resetting game..."
            className="mt-4 min-h-11 w-full rounded-full border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-900"
          >
            Reset game
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
