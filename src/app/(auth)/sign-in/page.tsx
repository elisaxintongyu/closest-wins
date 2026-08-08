import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

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
            Admins land in the question-management workspace. Players land in
            the gameplay workspace. The redirect happens automatically based on
            your role.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Need a player account?
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            New accounts created from this flow are assigned the player role.
            Admin access is reserved for seeded or manually promoted users.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-stone-800"
          >
            Create a player account
          </Link>
        </div>
      </div>
      <SignInForm />
    </section>
  );
}
