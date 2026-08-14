"use client";

import { useActionState } from "react";
import { createPresetTeam, deletePresetTeam } from "@/app/admin/actions";
import { FieldErrors, FormMessage } from "@/components/admin/form-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialActionState } from "@/lib/admin-validation";

type PresetTeamManagerProps = {
  gameId: string;
  teams: Array<{
    id: string;
    name: string;
    captainName: string | null;
    memberCount: number;
    guessCount: number;
  }>;
};

export function PresetTeamManager({
  gameId,
  teams,
}: PresetTeamManagerProps) {
  const createPresetTeamForGame = createPresetTeam.bind(null, gameId);
  const [state, formAction] = useActionState(
    createPresetTeamForGame,
    initialActionState
  );

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-stone-950">Preset teams</h2>
        <p className="text-sm leading-7 text-stone-700">
          Add the team names players are allowed to join for this game before
          the round flow begins.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          action={formAction}
          className="space-y-4 rounded-2xl border p-4 sm:p-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="preset-team-name"
              className="text-sm font-medium text-stone-900"
            >
              Team name
            </label>
            <input
              id="preset-team-name"
              name="teamName"
              type="text"
              maxLength={40}
              placeholder="Frontend Falcons"
              className="w-full rounded-lg border px-3 py-2"
            />
            <FieldErrors state={state} field="teamName" />
          </div>

          <FormMessage state={state} />

          <SubmitButton
            pendingLabel="Adding preset team..."
            className="min-h-11 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
            style={{ color: "#fff" }}
          >
            Add preset team
          </SubmitButton>
        </form>

        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              No preset teams yet. Add at least one before sending players into
              the join flow.
            </div>
          ) : (
            teams.map((team) => {
              const canDelete = team.memberCount === 0 && team.guessCount === 0;
              const deletePresetTeamById = deletePresetTeam.bind(null, team.id);

              return (
                <article
                  key={team.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold break-words text-stone-950">
                        {team.name}
                      </p>
                      <p className="text-sm text-stone-600">
                        {team.memberCount} member
                        {team.memberCount === 1 ? "" : "s"}
                        {team.captainName
                          ? ` · captain: ${team.captainName}`
                          : " · waiting for the first player"}
                      </p>
                    </div>
                    <form action={deletePresetTeamById}>
                      <SubmitButton
                        pendingLabel="Removing..."
                        disabled={!canDelete}
                        className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                      >
                        {canDelete ? "Remove team" : "Team in use"}
                      </SubmitButton>
                    </form>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
