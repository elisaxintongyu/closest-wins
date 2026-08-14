// Renders the admin sidebar that summarizes current and completed games.
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
  latestReveal?: {
    order: number;
    prompt: string;
    correctAnswer: number;
    explanation: string | null;
    winnerNames: string[];
  } | null;
};

function GameSummaryCard({ game }: { game: AdminGameSummary }) {
  return (
    <article className="min-w-0 rounded-[1.5rem] border border-stone-900/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
            {game.status}
          </p>
          <h3 className="mt-2 text-lg font-semibold break-words text-stone-950">
            {game.title}
          </h3>
        </div>
        <span className="max-w-full rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] break-all text-stone-700 uppercase">
          {game.joinCode}
        </span>
      </div>

      <p className="mt-3 text-sm text-stone-600">
        {game.questionCount} question{game.questionCount === 1 ? "" : "s"} ·{" "}
        {game.teamCount} team{game.teamCount === 1 ? "" : "s"}
      </p>

      <div className="mt-4 space-y-2">
        {game.latestReveal ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-7 text-stone-700">
            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
              Last revealed round
            </p>
            <p className="mt-2 font-semibold text-stone-950">
              Round {game.latestReveal.order}: {game.latestReveal.correctAnswer}
            </p>
            <p className="mt-1">{game.latestReveal.prompt}</p>
            <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Explanation
            </p>
            <p className="mt-1">
              {game.latestReveal.explanation ?? "No explanation was added."}
            </p>
            <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Winners
            </p>
            <p className="mt-1">
              {game.latestReveal.winnerNames.length > 0
                ? game.latestReveal.winnerNames.join(", ")
                : "No winning guesses were submitted."}
            </p>
          </div>
        ) : null}

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
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-900/10 bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
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
          <h2 className="text-lg font-semibold text-stone-950">
            Current games
          </h2>
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
