type RevealedAnswerPanelProps = {
  revealedQuestion: {
    order: number;
    prompt: string;
    correctAnswer: number;
    explanation: string | null;
  } | null;
};

export function RevealedAnswerPanel({
  revealedQuestion,
}: RevealedAnswerPanelProps) {
  if (!revealedQuestion) {
    return null;
  }

  return (
    <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
      <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
        Answer revealed
      </p>
      <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase">
        Round {revealedQuestion.order}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
        {revealedQuestion.correctAnswer}
      </h2>
      <p className="mt-3 text-base leading-8 text-stone-700">
        {revealedQuestion.prompt}
      </p>
      {revealedQuestion.explanation ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700">
          {revealedQuestion.explanation}
        </p>
      ) : null}
    </section>
  );
}
