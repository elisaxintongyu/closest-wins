import { CreateTeamForm } from "@/components/player/create-team-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";

export default async function PlayerPage() {
  const session = await requireRole("PLAYER");
  await syncDatabaseUser(session);

  return (
    <DashboardShell
      eyebrow="Player dashboard"
      title="Create your team and head into the game."
      description="Players can now join a game with its code, create a team, and keep track of the games they have already entered."
      userName={session.userName}
      roleLabel="Player"
      highlights={[
        "Players are synced into PostgreSQL the first time they use the game flow",
        "Team creation is tied directly to a real game join code",
        "The later lobby and gameplay milestones now have a real team layer to build on",
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              Start with a join code
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Ask the host for the game&apos;s six-character code, then create a
              team for that game.
            </p>
          </div>

          <CreateTeamForm />
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              What this unlocks
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Team creation is now persistent, so the next branches can add
              join, lobby, and gameplay routes on top of the same records.
            </p>
          </div>

          <div className="space-y-3">
            <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
              <p className="text-sm font-semibold tracking-[0.16em] text-stone-500 uppercase">
                Persistent teams
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-700">
                Creating a team now stores a captain, a game membership, and a
                durable team record in PostgreSQL.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
              <p className="text-sm font-semibold tracking-[0.16em] text-stone-500 uppercase">
                Ready for lobby flow
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-700">
                The same data model can support team lists, waiting-room views,
                and round gameplay without another schema reset.
              </p>
            </article>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
