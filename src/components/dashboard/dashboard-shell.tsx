import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  userName: string;
  roleLabel: string;
  highlights: string[];
  sidebarTitle?: string;
  sidebarContent?: ReactNode;
  children?: ReactNode;
};

export function DashboardShell({
  eyebrow,
  title,
  description,
  userName,
  roleLabel,
  highlights,
  sidebarTitle = "This milestone proves",
  sidebarContent,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-6 py-12 text-stone-950">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4 rounded-full border border-stone-900/10 bg-white/60 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-stone-500 uppercase">
              {eyebrow}
            </p>
            <p className="mt-1 text-sm text-stone-700">
              Signed in as {userName} ({roleLabel}).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Back home
            </Link>
            <div className="inline-flex items-center rounded-full border border-stone-900/10 bg-white px-3 py-2">
              <UserButton />
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-[2rem] border border-stone-900/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(120,53,15,0.12)] backdrop-blur">
            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
                Access granted
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700">
                {description}
              </p>
            </div>
            {children}
          </div>

          <aside className="rounded-[2rem] border border-stone-900/10 bg-stone-50/90 p-8 shadow-[0_24px_80px_rgba(120,53,15,0.08)]">
            <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
              {sidebarTitle}
            </p>
            {sidebarContent ? (
              <div className="mt-6">{sidebarContent}</div>
            ) : (
              <ul className="mt-6 space-y-4 text-sm leading-7 text-stone-700">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-2xl border border-stone-900/10 bg-white px-4 py-3"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
