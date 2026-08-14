import Link from "next/link";
import { notFound } from "next/navigation";
import { ActiveQuestionPanel } from "@/components/player/active-question-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RevealedAnswerPanel } from "@/components/player/revealed-answer-panel";
import { ScoreboardPanel } from "@/components/player/scoreboard-panel";
import { SubmitGuessForm } from "@/components/player/submit-guess-form";
import { requireRole, syncDatabaseUser } from "@/lib/auth-guards";
import { getQuestionWinners, getScoreboard } from "@/lib/gameplay";
import { prisma } from "@/lib/prisma";

export default async function PlayerGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await requireRole("PLAYER");
  const player = await syncDatabaseUser(session);
  const { gameId } = await params;
  const { status } = await searchParams;
  const joinStatus = typeof status === "string" ? status : undefined;

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
        },
      },
    },
  });

  if (!membership) {
    notFound();
  }

  const activeQuestion = await prisma.question.findFirst({
    where: {
      gameId,
      status: "OPEN",
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      order: true,
      prompt: true,
      guesses: {
        where: {
          teamId: membership.team.id,
        },
        select: {
          value: true,
        },
        take: 1,
      },
    },
  });

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
    await prisma.team.findMany({
      where: {
        gameId,
      },
      select: {
        id: true,
        name: true,
      },
    }),
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
      eyebrow="Player game"
      title={membership.game.title}
      description="Track your team, submit guesses, and jump to the lobby when you need it."
      userName={session.userName}
      roleLabel="Player"
      homeHref="/player"
      homeLabel="Player page"
      highlights={[
        `Team: ${membership.team.name}`,
        `Teams in game: ${membership.game._count.teams}`,
        `Current status: ${membership.game.status}`,
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          {joinStatus === "already-joined" ? (
            <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900 sm:p-6">
              You already joined this game with your current account, so we
              brought you back to your existing team page instead of creating a
              duplicate team.
            </section>
          ) : null}

          <section className="min-w-0 rounded-[1.75rem] border border-stone-200 bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Your team
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] break-words text-stone-950">
              {membership.team.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
              Your team is checked in for this game. Use this page to watch the
              current round, submit a guess, and keep an eye on the standings.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                Join code:{" "}
                <span className="font-mono break-all">
                  {membership.game.joinCode}
                </span>
              </div>
              <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                Team members: {membership.team._count.memberships}
              </div>
            </div>
          </section>

          <ActiveQuestionPanel activeQuestion={activeQuestion}>
            {activeQuestion ? (
              <SubmitGuessForm
                gameId={membership.game.id}
                questionId={activeQuestion.id}
                existingGuess={activeQuestion.guesses[0]?.value ?? null}
              />
            ) : null}
          </ActiveQuestionPanel>

          <RevealedAnswerPanel
            revealedQuestion={revealedQuestion}
            winners={revealedWinners}
            standingsPreview={standings}
          />
        </div>

        <section className="min-w-0 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Open next
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              Visit the lobby to see the full list of participating teams.
            </li>
            <li className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              The active question card above updates whenever the host opens the
              next round.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/player/lobby/${membership.game.id}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
              style={{ color: "#fff" }}
            >
              Open lobby
            </Link>
            <Link
              href="/player"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 sm:w-auto"
            >
              Back to player page
            </Link>
          </div>

          <div className="mt-5">
            <ScoreboardPanel
              standings={standings}
              currentTeamId={membership.team.id}
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
