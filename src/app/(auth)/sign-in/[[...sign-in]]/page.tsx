import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="grid w-full gap-8 rounded-[2rem] border border-stone-900/10 bg-white/80 p-8 shadow-[0_28px_90px_rgba(120,53,15,0.14)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
      <div className="space-y-6">
        <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
          Welcome back
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-stone-950">
            Sign in to your Closest Wins workspace.
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-700">
            Use Clerk to authenticate with the app. This branch keeps the same
            `/sign-in` route while delegating the auth flow to Clerk.
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
            className="mt-4 inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
          >
            Create a player account
          </Link>
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-stone-900/10 bg-stone-50/80 p-6">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </section>
  );
}
