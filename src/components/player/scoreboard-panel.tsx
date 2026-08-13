type ScoreboardPanelProps = {
  standings: {
    id: string;
    name: string;
    score: number;
    wins: number;
  }[];
  currentTeamId: string;
};

export function ScoreboardPanel({
  standings,
  currentTeamId,
}: ScoreboardPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
            Scoreboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
            Team standings
          </h2>
        </div>
        <p className="text-sm text-stone-600">
          {standings.length} team{standings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {standings.map((team, index) => {
          const isCurrentTeam = team.id === currentTeamId;

          return (
            <article
              key={team.id}
              className={`flex items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4 ${
                isCurrentTeam
                  ? "border-amber-300 bg-amber-50"
                  : "border-stone-200 bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-950">
                  {index + 1}
                </div>
                <div>
                  <p className="text-base font-semibold text-stone-950">
                    {team.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    {team.wins} round win{team.wins === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                  {team.score}
                </p>
                <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                  Points
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
