import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ActiveQuestionPanel } from "@/components/player/active-question-panel";
import { RevealedAnswerPanel } from "@/components/player/revealed-answer-panel";
import { ScoreboardPanel } from "@/components/player/scoreboard-panel";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { getQuestionWinners, getScoreboard } from "@/lib/gameplay";
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
          questions: {
            where: {
              status: "OPEN",
            },
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              order: true,
              prompt: true,
            },
            take: 1,
          },
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
              createdAt: true,
              _count: {
                select: {
                  memberships: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    notFound();
  }

  const revealedQuestion = await prisma.question.findFirst({
    where: {
      gameId,
      status: "REVEALED",
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
      prompt: true,
      correctAnswer: true,
      explanation: true,
      guesses: {
        select: {
          value: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  const revealedWinners = revealedQuestion
    ? getQuestionWinners(revealedQuestion)
    : [];
  const standings = getScoreboard(
    membership.game.teams.map((team) => ({
      id: team.id,
      name: team.name,
    })),
    await prisma.question.findMany({
      where: {
        gameId,
        status: "REVEALED",
      },
      select: {
        correctAnswer: true,
        guesses: {
          select: {
            value: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  );

  return (
    <DashboardShell
      eyebrow="Game lobby"
      title={membership.game.title}
      description="See who has joined and wait here for the next round to open."
      userName={session.userName}
      roleLabel="Player"
      homeHref="/player"
      homeLabel="Player page"
      highlights={[
        `Team: ${membership.team.name}`,
        `Join code: ${membership.game.joinCode}`,
        `Lobby status: ${membership.game.status}`,
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Waiting room
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
              {membership.team.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
              Your team is checked in. Share the join code with teammates and
              stay here while the host opens the round flow.
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

          <ActiveQuestionPanel
            activeQuestion={membership.game.questions[0] ?? null}
          />

          <RevealedAnswerPanel
            revealedQuestion={revealedQuestion}
            winners={revealedWinners}
          />
        </div>

        <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Next steps
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              Watch the active-question card for the moment a new round opens.
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              The player game page remains your team&apos;s persistent home if
              you want to jump out of the shared lobby view.
            </li>
          </ul>
          <Link
            href="/player"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Back to player page
          </Link>
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Participating teams
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              Who&apos;s in the lobby
            </h2>
          </div>
          <p className="text-sm text-stone-600">
            {membership.game.teams.length} team
            {membership.game.teams.length === 1 ? "" : "s"} joined
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {membership.game.teams.map((team) => {
            const isCurrentTeam = team.id === membership.team.id;

            return (
              <article
                key={team.id}
                className={`rounded-[1.5rem] border p-5 ${
                  isCurrentTeam
                    ? "border-amber-300 bg-amber-50"
                    : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-950">
                      {team.name}
                    </p>
                    <p className="text-sm text-stone-600">
                      {team._count.memberships} member
                      {team._count.memberships === 1 ? "" : "s"}
                    </p>
                  </div>
                  {isCurrentTeam ? (
                    <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
                      Your team
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ScoreboardPanel
        standings={standings}
        currentTeamId={membership.team.id}
      />
    </DashboardShell>
  );
}
