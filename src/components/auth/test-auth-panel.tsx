import Link from "next/link";

type TestAuthPanelProps = {
  mode: "sign-in" | "sign-up";
};

const demoUsers = [
  {
    email: "admin@closestwins.com",
    name: "Closest Wins Admin",
    role: "ADMIN",
    label: "Continue as demo admin",
    redirectTo: "/admin",
  },
  {
    email: "user@closestwins.com",
    name: "Demo User",
    role: "PLAYER",
    label: "Continue as demo player",
    redirectTo: "/player",
  },
] as const;

export function TestAuthPanel({ mode }: TestAuthPanelProps) {
  const isSignIn = mode === "sign-in";

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase">
          E2E auth mode
        </p>
        <p className="mt-2 text-sm leading-7 text-amber-950">
          These controls are only available when <code>E2E_TEST_MODE=true</code>
          . They create a local test session without using Clerk&apos;s hosted
          UI so Playwright can verify the app&apos;s routing and role behavior
          reliably in local and CI runs.
        </p>
      </div>

      <div className="space-y-3">
        {demoUsers.map((user) => (
          <form key={user.email} action="/api/test/session" method="post">
            <input type="hidden" name="email" value={user.email} />
            <input type="hidden" name="name" value={user.name} />
            <input type="hidden" name="role" value={user.role} />
            <input type="hidden" name="redirectTo" value={user.redirectTo} />
            <button
              type="submit"
              className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-stone-300 hover:bg-stone-50"
            >
              <span>
                <span className="block text-sm font-semibold text-stone-950">
                  {user.label}
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  {user.email}
                </span>
              </span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-stone-700 uppercase">
                {user.role}
              </span>
            </button>
          </form>
        ))}
      </div>

      {isSignIn ? (
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Need a fresh player account?
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Use the local sign-up form to create a brand-new player test user.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Open test sign-up
          </Link>
        </div>
      ) : (
        <form action="/api/test/session" method="post" className="space-y-4">
          <input type="hidden" name="role" value="PLAYER" />
          <input type="hidden" name="redirectTo" value="/player" />

          <div className="space-y-2">
            <label
              htmlFor="test-name"
              className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
            >
              Player name
            </label>
            <input
              id="test-name"
              name="name"
              type="text"
              required
              placeholder="Player Test User"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="test-email"
              className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
            >
              Player email
            </label>
            <input
              id="test-email"
              name="email"
              type="email"
              required
              placeholder="player+e2e@closestwins.com"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            style={{ color: "#fff" }}
          >
            Create player test account
          </button>
        </form>
      )}
    </div>
  );
}
