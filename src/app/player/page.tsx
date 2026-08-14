import Link from "next/link";
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
  const player = await syncDatabaseUser(session);
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
            teams: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
                name: true,
                _count: {
                  select: {
                    memberships: true,
                  },
                },
              },
            },
          },
        })
      : null;
  const memberships = await prisma.teamMembership.findMany({
    where: {
      userId: player.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      gameId: true,
      team: {
        select: {
          id: true,
          name: true,
          game: {
            select: {
              title: true,
              joinCode: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return (
    <DashboardShell
      eyebrow="Player dashboard"
      title="Player page"
      description="Enter a join code, create your team, and reopen any game you've already joined."
      userName={session.userName}
      roleLabel="Player"
      highlights={[]}
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
              Pick your team
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Once the join code checks out, choose one of the preset teams the
              host prepared for this game.
            </p>
          </div>

          <CreateTeamForm
            joinCode={selectedGame?.joinCode}
            gameTitle={selectedGame?.title}
            presetTeams={
              selectedGame?.teams.map((team) => ({
                id: team.id,
                name: team.name,
                memberCount: team._count.memberships,
              })) ?? []
            }
          />

          <div className="space-y-3">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">
                Your game pages
              </h3>
              <p className="text-sm leading-7 text-stone-700">
                Jump back into any game you&apos;ve already joined.
              </p>
            </div>

            {memberships.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
                No active game pages yet. Join a game above to create your first
                team home.
              </div>
            ) : (
              <div className="space-y-3">
                {memberships.map((membership) => (
                  <article
                    key={membership.team.id}
                    className="min-w-0 rounded-[1.75rem] border border-stone-200 bg-white p-5"
                  >
                    <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
                      {membership.team.game.status}
                    </p>
                    <h4 className="mt-2 text-xl font-semibold break-words text-stone-950">
                      {membership.team.name}
                    </h4>
                    <p className="mt-1 text-sm text-stone-700">
                      Game: {membership.team.game.title}
                    </p>
                    <p className="text-sm text-stone-700">
                      Join code:{" "}
                      <span className="font-mono break-all">
                        {membership.team.game.joinCode}
                      </span>
                    </p>
                    <Link
                      href={`/player/games/${membership.gameId}`}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-900/10 bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
                      style={{ color: "#fff" }}
                    >
                      Open player game page
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
