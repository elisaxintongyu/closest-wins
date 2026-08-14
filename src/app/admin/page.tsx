import Link from "next/link";
import {
  AdminGameSummarySidebar,
  type AdminGameSummary,
} from "@/components/admin/admin-game-summary-sidebar";
import { CreateGameForm } from "@/components/admin/create-game-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";
import { getScoreboard } from "@/lib/gameplay";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");
  const games = session.databaseUserId
    ? await prisma.game.findMany({
        where: {
          createdById: session.databaseUserId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          joinCode: true,
          status: true,
          teams: {
            select: {
              id: true,
              name: true,
            },
          },
          questions: {
            where: {
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
          },
          _count: {
            select: {
              questions: true,
              teams: true,
            },
          },
        },
      })
    : [];
  const summarizedGames: AdminGameSummary[] = games.map((game) => ({
    id: game.id,
    title: game.title,
    joinCode: game.joinCode,
    status: game.status,
    questionCount: game._count.questions,
    teamCount: game._count.teams,
    standings: getScoreboard(game.teams, game.questions),
  }));
  const currentGames = summarizedGames.filter(
    (game) => game.status !== "COMPLETED"
  );
  const completedGames = summarizedGames.filter(
    (game) => game.status === "COMPLETED"
  );

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Admin page"
      description="Create games, manage questions, and keep track of current sessions."
      userName={session.userName}
      roleLabel="Administrator"
      sidebarTitle="Game history"
      sidebarContent={
        <AdminGameSummarySidebar
          currentGames={currentGames}
          completedGames={completedGames}
        />
      }
      highlights={[]}
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Create a game
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Start a new game session and generate a join code for players.
            </p>
          </div>

          <CreateGameForm />
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Manage your games
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Jump back into active sessions, check team counts, and open the
              full question manager for any game.
            </p>
          </div>

          {summarizedGames.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              No games yet. Create one to begin the admin game flow.
            </div>
          ) : (
            <div className="space-y-3">
              {summarizedGames.map((game) => {
                const leadingTeam = game.standings[0];

                return (
                  <article
                    key={game.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
                          {game.status}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-stone-950">
                          {game.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-stone-700 uppercase">
                        {game.joinCode}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                          Questions
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-stone-950">
                          {game.questionCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                          Teams
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-stone-950">
                          {game.teamCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                          Leader
                        </p>
                        <p className="mt-2 text-base font-semibold text-stone-950">
                          {leadingTeam ? leadingTeam.name : "No scores yet"}
                        </p>
                        <p className="text-sm text-stone-600">
                          {leadingTeam
                            ? `${leadingTeam.score} point${leadingTeam.score === 1 ? "" : "s"}`
                            : "Reveal a round to populate standings."}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/games/${game.id}`}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                      style={{ color: "#fff" }}
                    >
                      Manage questions
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
