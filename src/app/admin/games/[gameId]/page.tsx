import Link from "next/link";
import { notFound } from "next/navigation";
import { BulkQuestionUploadForm } from "@/components/admin/bulk-question-upload-form";
import { CreateQuestionForm } from "@/components/admin/create-question-form";
import { GameSessionControls } from "@/components/admin/game-session-controls";
import { PresetTeamManager } from "@/components/admin/preset-team-manager";
import { QuestionEditor } from "@/components/admin/question-editor";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function AdminGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const session = await requireRole("ADMIN");

  if (!session.databaseUserId) {
    notFound();
  }

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      createdById: session.databaseUserId,
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
      questions: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          prompt: true,
          correctAnswer: true,
          explanation: true,
          order: true,
          status: true,
          guesses: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              value: true,
              createdAt: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      teams: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          captain: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              memberships: true,
              guesses: true,
            },
          },
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  const openQuestion = game.questions.find(
    (question) => question.status === "OPEN"
  );
  const hiddenQuestions = game.questions.filter(
    (question) => question.status === "HIDDEN"
  ).length;

  return (
    <DashboardShell
      eyebrow="Question management"
      title={game.title}
      description="Create questions, update round order, and run the game from one place."
      userName={session.userName}
      roleLabel="Administrator"
      homeHref="/admin"
      homeLabel="Admin page"
      highlights={[
        `Join code: ${game.joinCode}`,
        `Game status: ${game.status}`,
        `${game.questions.length} question${game.questions.length === 1 ? "" : "s"} in this game`,
      ]}
    >
      <div className="space-y-8">
        <Link
          href="/admin"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 sm:w-auto"
        >
          Back to all games
        </Link>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Round flow
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {openQuestion
                ? `Question ${openQuestion.order} is live`
                : "No round is open"}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Only one question can be open at a time. Close the current round
              before starting the next one.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Waiting
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {hiddenQuestions} hidden question
              {hiddenQuestions === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Hidden questions are still in the queue and can be opened when you
              are ready to run the next round.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
              Game state
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-950">
              {game.status}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Opening the first round automatically moves the game into the
              active gameplay state.
            </p>
          </article>
        </section>

        <GameSessionControls gameId={game.id} gameStatus={game.status} />

        <PresetTeamManager
          gameId={game.id}
          teams={game.teams.map((team) => ({
            id: team.id,
            name: team.name,
            captainName: team.captain?.name ?? team.captain?.email ?? null,
            memberCount: team._count.memberships,
            guessCount: team._count.guesses,
          }))}
        />

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Add questions
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Add one question at a time or bulk upload a spreadsheet. New
              questions start at the bottom of the set and can be reordered
              immediately.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-stone-950">
                  Single question
                </h3>
                <p className="text-sm text-stone-700">
                  Use the form below for one-off additions.
                </p>
              </div>
              <CreateQuestionForm gameId={game.id} />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-stone-950">
                  Bulk upload
                </h3>
                <p className="text-sm text-stone-700">
                  Import multiple rows from an Excel sheet in one pass.
                </p>
              </div>
              <BulkQuestionUploadForm gameId={game.id} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Question list
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Reorder questions with the move buttons and save edits inline.
            </p>
          </div>

          {game.questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              This game has no questions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {game.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  totalTeamCount={game._count.teams}
                  canMoveUp={index > 0}
                  canMoveDown={index < game.questions.length - 1}
                  canOpenRound={!openQuestion && question.status === "HIDDEN"}
                  canCloseRound={question.status === "OPEN"}
                  canRevealRound={question.status === "CLOSED"}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
