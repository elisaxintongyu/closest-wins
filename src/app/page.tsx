export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_32%),linear-gradient(135deg,_#fff7ed_0%,_#fde68a_42%,_#fca5a5_100%)] px-6 py-12 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-between gap-10">
        <header className="rounded-full border border-stone-900/10 bg-white/55 px-5 py-4 backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.28em] text-stone-500 uppercase">
            Closest Wins
          </p>
          <p className="mt-2 text-sm text-stone-700">
            Milestone 1 foundation for the game platform.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-stone-900/10 bg-white/60 px-4 py-1 text-sm font-medium tracking-[0.2em] text-stone-700 uppercase backdrop-blur">
              Next.js setup
            </p>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                A clean App Router starter for Closest Wins.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
                This repository now runs on Next.js with TypeScript and
                Tailwind, giving us a production-ready base for the game,
                dashboards, and future multiplayer flows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Framework
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Next.js 16 with the App Router and React 19.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Language
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  TypeScript is enabled from the start for safer iteration.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Styling
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Tailwind CSS 4 is wired in for fast, consistent UI work.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-900/10 bg-white/75 p-8 shadow-[0_24px_80px_rgba(120,53,15,0.18)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
              Ready for milestone 2
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-stone-700">
              <li>Database and authentication can layer onto this base.</li>
              <li>Shared UI patterns are in place for future screens.</li>
              <li>The app already builds around the final project name.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
