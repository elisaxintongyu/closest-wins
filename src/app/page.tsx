import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const demoAccounts = [
  {
    email: "admin@closestwins.com",
    password: "Admin123!",
    role: "Admin",
  },
  {
    email: "user@closestwins.com",
    password: "Player123!",
    role: "User",
  },
];

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
              Milestone 2 now includes seeded users, protected role-aware
              routes, and Clerk authentication on top of Prisma and Neon.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-white"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
                >
                  Create account
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
              >
                Open dashboard
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-stone-900/10 bg-white/80 px-3 py-2">
                <span className="text-sm font-medium text-stone-700">
                  Signed in
                </span>
                <UserButton />
              </div>
            </Show>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-stone-900/10 bg-white/60 px-4 py-1 text-sm font-medium tracking-[0.2em] text-stone-700 uppercase backdrop-blur">
              Database and authentication
            </p>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Role-based access is now part of the app&apos;s core flow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
                Prisma models, Neon-backed data, seeded demo users, Clerk
                sign-in, and strict admin-versus-player routing are now wired
                together in the app.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Data
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Prisma, Neon, seeds, and the role-aware user schema now work
                  together as the application foundation.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Auth
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Clerk powers sign-in, sign-up, session management, and role
                  entry into the app.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.1)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  Access
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Protected admin and player dashboards with route-level guards.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-900/10 bg-white/75 p-8 shadow-[0_24px_80px_rgba(120,53,15,0.18)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
              Seeded demo accounts
            </p>
            <ul className="mt-6 space-y-4">
              {demoAccounts.map((account) => (
                <li
                  key={account.email}
                  className="rounded-2xl border border-stone-900/10 bg-stone-50/80 p-4"
                >
                  <p className="text-sm font-semibold text-stone-900">
                    {account.role}
                  </p>
                  <p className="mt-2 text-sm text-stone-700">{account.email}</p>
                  <p className="font-mono text-sm text-stone-500">
                    {account.password}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-stone-600">
              These accounts are created by the Prisma seed script for local
              development and testing.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
