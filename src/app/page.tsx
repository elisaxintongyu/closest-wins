import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.8),_transparent_30%),linear-gradient(135deg,_#fff7ed_0%,_#fde68a_45%,_#fca5a5_100%)] px-6 py-12 text-stone-950">
      <div className="absolute inset-y-0 right-[-12%] hidden w-[42rem] rotate-[18deg] rounded-[4rem] border border-white/50 bg-white/20 blur-3xl lg:block" />
      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col justify-between gap-12">
        <header className="flex flex-col gap-4 rounded-full border border-stone-900/10 bg-white/50 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-stone-500 uppercase">
              Closest Wins
            </p>
            <p className="mt-1 text-sm text-stone-700">
              Milestone 2 has started with a typed frontend foundation and the
              first pass of the Prisma data model.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="https://www.prisma.io/docs/orm/prisma-schema/overview"
              className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-white"
            >
              Prisma schema docs
            </Link>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-stone-900/10 bg-white/60 px-4 py-1 text-sm font-medium tracking-[0.2em] text-stone-700 uppercase backdrop-blur">
              Database and authentication
            </p>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                The first database models are now part of the app.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
                This branch introduces Prisma to the project and establishes the
                core user, account, session, and verification token models that
                later authentication work will build on.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Data
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Prisma is installed and the initial schema is part of the
                  repo.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Models
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  The schema covers users plus the Auth.js adapter tables we
                  will need later.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Next step
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  PostgreSQL connection and local database workflow come next in
                  the stack.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-900/10 bg-white/75 p-8 shadow-[0_24px_80px_rgba(120,53,15,0.18)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
              Included in this branch
            </p>
            <ul className="mt-6 space-y-4">
              <li className="rounded-2xl border border-stone-900/10 bg-stone-50/80 p-4 text-sm leading-7 text-stone-700">
                Project setup from Milestone 1 so the schema work has a real
                Next.js base to land in.
              </li>
              <li className="rounded-2xl border border-stone-900/10 bg-stone-50/80 p-4 text-sm leading-7 text-stone-700">
                Prisma CLI, generated client support, and the first database
                schema file.
              </li>
              <li className="rounded-2xl border border-stone-900/10 bg-stone-50/80 p-4 text-sm leading-7 text-stone-700">
                A UI note on the homepage explaining what part of the milestone
                this branch covers.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
