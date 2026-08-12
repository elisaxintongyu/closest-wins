import { CreateTeamForm } from "@/components/player/create-team-form";
import { JoinCodeForm } from "@/components/player/join-code-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

function normalizeJoinCode(joinCode: string | string[] | undefined) {
  if (typeof joinCode !== "string") {
    return "";
  }

  return joinCode.trim().toUpperCase();
}

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ joinCode?: string | string[] }>;
}) {
  const session = await requireRole("PLAYER");
  await syncDatabaseUser(session);
  const { joinCode } = await searchParams;
  const normalizedJoinCode = normalizeJoinCode(joinCode);
  const selectedGame =
    normalizedJoinCode.length === 6
      ? await prisma.game.findUnique({
          where: {
            joinCode: normalizedJoinCode,
          },
          select: {
            id: true,
            title: true,
            joinCode: true,
            status: true,
            _count: {
              select: {
                teams: true,
              },
            },
          },
        })
      : null;

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
              Find your game
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Enter the host&apos;s six-character join code to confirm
              you&apos;re entering the right game.
            </p>
          </div>

          <JoinCodeForm defaultJoinCode={normalizedJoinCode} />

          {normalizedJoinCode ? (
            selectedGame ? (
              <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                  Game found
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                  {selectedGame.title}
                </h3>
                <p className="mt-2 text-sm text-stone-700">
                  Status: {selectedGame.status}
                </p>
                <p className="text-sm text-stone-700">
                  Teams already joined: {selectedGame._count.teams}
                </p>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700">
                No game matched{" "}
                <span className="font-mono">{normalizedJoinCode}</span>.
                Double-check the code with the host and try again.
              </div>
            )
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              Name your team
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Once the join code checks out, create the team that will compete
              in this game.
            </p>
          </div>

          <CreateTeamForm
            joinCode={selectedGame?.joinCode}
            gameTitle={selectedGame?.title}
          />
        </section>
      </div>
    </DashboardShell>
  );
}
