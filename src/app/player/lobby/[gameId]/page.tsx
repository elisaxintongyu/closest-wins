import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function PlayerLobbyPage({
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
          createdAt: true,
        },
      },
      game: {
        select: {
          id: true,
          title: true,
          joinCode: true,
          status: true,
          createdAt: true,
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
      eyebrow="Game lobby"
      title={membership.game.title}
      description="Your team is in the lobby. This page is the shared waiting room while the host gets the game ready."
      userName={session.userName}
      roleLabel="Player"
      highlights={[
        `Team: ${membership.team.name}`,
        `Join code: ${membership.game.joinCode}`,
        `Lobby status: ${membership.game.status}`,
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Waiting room
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
            {membership.team.name}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
            Your team is checked in. Share the join code with teammates and stay
            here while the host opens the round flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
              Code:{" "}
              <span className="font-mono">{membership.game.joinCode}</span>
            </div>
            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
              Teams joined: {membership.game._count.teams}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Next steps
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              The host will move the game from setup into the playable flow in a
              later milestone.
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              This lobby will expand with participating-team visibility and
              player-specific game details in the next branches.
            </li>
          </ul>
          <Link
            href="/player"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Back to player dashboard
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
