"use client";

import { useActionState } from "react";
import { createTeam } from "@/app/player/actions";
import {
  PlayerFieldErrors,
  PlayerFormMessage,
} from "@/components/player/form-feedback";
import { initialPlayerActionState } from "@/lib/player-validation";

export function CreateTeamForm({
  joinCode,
  gameTitle,
}: {
  joinCode?: string;
  gameTitle?: string;
}) {
  const [state, formAction] = useActionState(
    createTeam,
    initialPlayerActionState
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[1.75rem] border border-stone-900/10 bg-white p-5 shadow-[0_18px_60px_rgba(120,53,15,0.08)]"
    >
      {joinCode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
            Joining
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {gameTitle ?? "Selected game"}
          </p>
          <p className="mt-1 font-mono text-sm tracking-[0.2em] text-stone-700">
            {joinCode}
          </p>
          <input type="hidden" name="joinCode" value={joinCode} />
        </div>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="join-code"
            className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
          >
            Game join code
          </label>
          <input
            id="join-code"
            name="joinCode"
            type="text"
            maxLength={6}
            placeholder="AB12CD"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 font-mono text-lg tracking-[0.3em] uppercase"
          />
          <PlayerFieldErrors state={state} field="joinCode" />
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="team-name"
          className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
        >
          Team name
        </label>
        <input
          id="team-name"
          name="teamName"
          type="text"
          maxLength={40}
          placeholder="Closest Crew"
          className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
        />
        <PlayerFieldErrors state={state} field="teamName" />
      </div>

      <PlayerFormMessage state={state} />

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
      >
        Create team
      </button>
    </form>
  );
}
