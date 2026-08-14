import type { ReactNode } from "react";

type ActiveQuestionPanelProps = {
  activeQuestion: {
    id: string;
    order: number;
    prompt: string;
  } | null;
  children?: ReactNode;
};

export function ActiveQuestionPanel({
  activeQuestion,
  children,
}: ActiveQuestionPanelProps) {
  return (
    <section className="min-w-0 rounded-[1.75rem] border border-stone-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
        Active question
      </p>

      {activeQuestion ? (
        <>
          <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
            Round {activeQuestion.order} is open
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] break-words text-stone-950">
            {activeQuestion.prompt}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
            The host has opened this question. Keep your team aligned and get
            ready to submit a single numeric guess once the answer form is
            available.
          </p>
          {children ? <div className="mt-5">{children}</div> : null}
        </>
      ) : (
        <>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
            Waiting for the next round
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-stone-700">
            No question is live right now. Stay on this page and refresh when
            the host moves the next round into play.
          </p>
        </>
      )}
    </section>
  );
}
