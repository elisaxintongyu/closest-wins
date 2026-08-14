"use client";

import { useActionState } from "react";
import { createTeam } from "@/app/player/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  PlayerFieldErrors,
  PlayerFormMessage,
} from "@/components/player/form-feedback";
import { initialPlayerActionState } from "@/lib/player-validation";

export function CreateTeamForm({
  joinCode,
  gameTitle,
  presetTeams,
}: {
  joinCode?: string;
  gameTitle?: string;
  presetTeams: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
}) {
  const [state, formAction] = useActionState(
    createTeam,
    initialPlayerActionState
  );
  const canJoin = Boolean(joinCode) && presetTeams.length > 0;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[1.75rem] border border-stone-900/10 bg-white p-5 shadow-[0_18px_60px_rgba(120,53,15,0.08)] sm:p-6"
    >
      {joinCode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
            Joining
          </p>
          <p className="mt-2 text-lg font-semibold break-words text-stone-950">
            {gameTitle ?? "Selected game"}
          </p>
          <p className="mt-1 font-mono text-sm tracking-[0.2em] break-all text-stone-700">
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
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 font-mono text-base tracking-[0.2em] uppercase sm:text-lg sm:tracking-[0.3em]"
          />
          <PlayerFieldErrors state={state} field="joinCode" />
        </div>
      )}

      {canJoin ? (
        <div className="space-y-2">
          <label
            htmlFor="team-id"
            className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
          >
            Available teams
          </label>
          <select
            id="team-id"
            name="teamId"
            defaultValue=""
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base"
          >
            <option value="" disabled>
              Select a preset team
            </option>
            {presetTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <PlayerFieldErrors state={state} field="teamId" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-600">
          {joinCode
            ? "The host has not added any preset teams yet. Ask them to add team names before you join."
            : "Enter a valid join code above to load the host's preset team list."}
        </div>
      )}

      <PlayerFormMessage state={state} />

      <SubmitButton
        pendingLabel="Joining team..."
        disabled={!canJoin}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
        style={{ color: "#fff" }}
      >
        Join team
      </SubmitButton>
    </form>
  );
}
