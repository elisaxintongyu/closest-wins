import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function PlayerGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const session = await requireRole("PLAYER");
  const player = await syncDatabaseUser(session);
  const { gameId } = await params;

  const membership = await prisma.teamMembership.findFirst({
    where: {
      gameId,
      userId: player.id,
    },
    select: {
      team: {
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
      game: {
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
      },
    },
  });

  if (!membership) {
    notFound();
  }

  return (
    <DashboardShell
      eyebrow="Player game"
      title={membership.game.title}
      description="This is your team’s dedicated game home. Use it to keep your place in the game and jump into the live lobby whenever you need it."
      userName={session.userName}
      roleLabel="Player"
      highlights={[
        `Team: ${membership.team.name}`,
        `Teams in game: ${membership.game._count.teams}`,
        `Current status: ${membership.game.status}`,
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Your team
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
            {membership.team.name}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
            You&apos;re registered for this game and ready for the next gameplay
            steps. This page gives players a stable home separate from the live
            lobby view.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
              Join code:{" "}
              <span className="font-mono">{membership.game.joinCode}</span>
            </div>
            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
              Team members: {membership.team._count.memberships}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Open next
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              Visit the lobby to see the full list of participating teams.
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              Later milestones will add rounds, questions, and scoring on top of
              this player-game entry point.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/player/lobby/${membership.game.id}`}
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
            >
              Open lobby
            </Link>
            <Link
              href="/player"
              className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
