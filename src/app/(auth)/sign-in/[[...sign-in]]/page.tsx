import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { TestAuthPanel } from "@/components/auth/test-auth-panel";
import { isE2ETestModeEnabled } from "@/lib/test-mode";

export default function SignInPage() {
  const isE2ETestMode = isE2ETestModeEnabled();

  return (
    <section className="grid w-full gap-6 rounded-[2rem] border border-stone-900/10 bg-white/80 p-5 shadow-[0_28px_90px_rgba(120,53,15,0.14)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:p-10">
      <div className="min-w-0 space-y-6">
        <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
          Welcome back
        </p>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
            Sign in to your Closest Wins workspace.
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-700">
            Use your account to open the right admin or player page for your
            role.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Need an account?
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Create one through Clerk on the sign-up route, then return here any
            time to sign back in.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
            style={{ color: "#fff" }}
          >
            Create a player account
          </Link>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-stone-900/10 bg-stone-50/80 p-4 sm:p-6">
        {isE2ETestMode ? (
          <TestAuthPanel mode="sign-in" />
        ) : (
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
          />
        )}
      </div>
    </section>
  );
}
