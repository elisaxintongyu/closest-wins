type LoadingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  sidebarTitle?: string;
};

export function LoadingShell({
  eyebrow,
  title,
  description,
  sidebarTitle = "Loading",
}: LoadingShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-4 py-6 text-stone-950 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col gap-6 sm:min-h-[calc(100vh-6rem)] sm:gap-10">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-900/10 bg-white/60 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.28em] text-stone-500 uppercase">
              {eyebrow}
            </p>
            <div className="h-4 w-56 animate-pulse rounded-full bg-stone-200" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-full bg-white sm:w-36" />
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
          <div className="space-y-6 rounded-[2rem] border border-stone-900/10 bg-white/80 p-5 shadow-[0_24px_80px_rgba(120,53,15,0.12)] backdrop-blur sm:p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.2em] text-stone-500 uppercase">
                Loading
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700">
                {description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-[1.75rem] bg-stone-100" />
              <div className="h-32 animate-pulse rounded-[1.75rem] bg-stone-100" />
              <div className="h-32 animate-pulse rounded-[1.75rem] bg-stone-100" />
            </div>
          </div>

          <aside className="space-y-4 rounded-[2rem] border border-stone-900/10 bg-stone-50/90 p-5 shadow-[0_24px_80px_rgba(120,53,15,0.08)] sm:p-8">
            <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
              {sidebarTitle}
            </p>
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-white" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-white" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-white" />
          </aside>
        </section>
      </div>
    </main>
  );
}
