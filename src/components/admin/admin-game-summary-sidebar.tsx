import Link from "next/link";

export type AdminGameSummary = {
  id: string;
  title: string;
  joinCode: string;
  status: string;
  questionCount: number;
  teamCount: number;
  standings: {
    id: string;
    name: string;
    score: number;
    wins: number;
  }[];
};

function GameSummaryCard({ game }: { game: AdminGameSummary }) {
  return (
    <article className="rounded-[1.5rem] border border-stone-900/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
            {game.status}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-950">
            {game.title}
          </h3>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-stone-700 uppercase">
          {game.joinCode}
        </span>
      </div>

      <p className="mt-3 text-sm text-stone-600">
        {game.questionCount} question{game.questionCount === 1 ? "" : "s"} ·{" "}
        {game.teamCount} team{game.teamCount === 1 ? "" : "s"}
      </p>

      <div className="mt-4 space-y-2">
        {game.standings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
            No team scores yet.
          </p>
        ) : (
          game.standings.map((team, index) => (
            <div
              key={team.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-stone-950">
                  {index + 1}. {team.name}
                </p>
                <p className="text-xs text-stone-600">
                  {team.wins} win{team.wins === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-lg font-semibold text-stone-950">
                {team.score}
              </p>
            </div>
          ))
        )}
      </div>

      <Link
        href={`/admin/games/${game.id}`}
        className="mt-4 inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        style={{ color: "#fff" }}
      >
        Open game
      </Link>
    </article>
  );
}

export function AdminGameSummarySidebar({
  currentGames,
  completedGames,
}: {
  currentGames: AdminGameSummary[];
  completedGames: AdminGameSummary[];
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">Current games</h2>
          <p className="text-sm text-stone-600">
            Games still in setup or active play.
          </p>
        </div>

        {currentGames.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-600">
            No current games yet.
          </div>
        ) : (
          <div className="space-y-4">
            {currentGames.map((game) => (
              <GameSummaryCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">Game history</h2>
          <p className="text-sm text-stone-600">
            Completed games with final team scores.
          </p>
        </div>

        {completedGames.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-600">
            No completed games yet.
          </div>
        ) : (
          <div className="space-y-4">
            {completedGames.map((game) => (
              <GameSummaryCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
