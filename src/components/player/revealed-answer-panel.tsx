// Renders the revealed-answer summary and updated standings preview.
type RevealedAnswerPanelProps = {
  revealedQuestion: {
    order: number;
    prompt: string;
    correctAnswer: number;
    explanation: string | null;
  } | null;
  winners: {
    team: {
      name: string;
    };
    value: number;
    distance: number;
  }[];
  standingsPreview?: {
    id: string;
    name: string;
    score: number;
    wins: number;
  }[];
};

export function RevealedAnswerPanel({
  revealedQuestion,
  winners,
  standingsPreview = [],
}: RevealedAnswerPanelProps) {
  if (!revealedQuestion) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
        Answer revealed
      </p>
      <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase">
        Round {revealedQuestion.order}
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Prompt
            </p>
            <p className="mt-2 text-base leading-8 break-words text-stone-700">
              {revealedQuestion.prompt}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Correct answer
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] break-words text-stone-950">
              {revealedQuestion.correctAnswer}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 text-stone-700">
          <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
            Winners
          </p>
          {winners.length === 0 ? (
            <p className="mt-2">No team submitted a guess for this round.</p>
          ) : (
            <>
              <p className="mt-2 font-semibold text-stone-950">
                Winner{winners.length === 1 ? "" : "s"}:{" "}
                {winners.map((winner) => winner.team.name).join(", ")}
              </p>
              <p className="mt-1">
                Closest guess{winners.length === 1 ? "" : "es"}:{" "}
                {winners
                  .map(
                    (winner) => `${winner.value} (off by ${winner.distance})`
                  )
                  .join(", ")}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-7 text-stone-700">
        <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
          Explanation
        </p>
        {winners.length === 0 ? (
          <p className="mt-2">
            {revealedQuestion.explanation ??
              "No explanation was added for this round."}
          </p>
        ) : (
          <p className="mt-2">
            {revealedQuestion.explanation ??
              "No explanation was added for this round."}
          </p>
        )}
      </div>

      {standingsPreview.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                Updated standings
              </p>
              <p className="mt-1 text-sm text-stone-700">
                Scores below include the revealed result from round{" "}
                {revealedQuestion.order}.
              </p>
            </div>
            <p className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
              Top {Math.min(standingsPreview.length, 3)}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {standingsPreview.slice(0, 3).map((team, index) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-stone-950">
                    {index + 1}. {team.name}
                  </p>
                  <p className="text-xs text-stone-600">
                    {team.wins} round win{team.wins === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-stone-950">
                  {team.score}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
