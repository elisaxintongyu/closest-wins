import { CreateGameForm } from "@/components/admin/create-game-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";
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
        },
      })
    : [];

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Create and manage game sessions."
      description="Admins can now create persistent game records with unique join codes from the protected dashboard."
      userName={session.userName}
      roleLabel="Administrator"
      highlights={[
        "Game sessions are stored in PostgreSQL through Prisma",
        "Each game gets a unique join code generated on the server",
        "The dashboard now shows the games created by this admin",
      ]}
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
              Existing games
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Review the sessions you have already created.
            </p>
          </div>

          {games.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              No games yet. Create one to begin the admin game flow.
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <article
                  key={game.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <h3 className="text-lg font-semibold text-stone-950">
                    {game.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-700">
                    Join code: <span className="font-mono">{game.joinCode}</span>
                  </p>
                  <p className="text-sm text-stone-700">
                    Status: {game.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
