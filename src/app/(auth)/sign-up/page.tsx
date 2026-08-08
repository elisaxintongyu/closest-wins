import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <section className="grid w-full gap-8 rounded-[2rem] border border-stone-900/10 bg-white/80 p-8 shadow-[0_28px_90px_rgba(120,53,15,0.14)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
      <div className="space-y-6">
        <p className="text-sm font-semibold tracking-[0.24em] text-stone-500 uppercase">
          Create account
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-stone-950">
            Register a player account in a few seconds.
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-700">
            Sign-up creates a player profile, stores it in PostgreSQL through
            Prisma, and signs the user in immediately.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Already have an account?
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Use the seeded demo credentials from the homepage or sign in with
            any previously created account.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Go to sign in
          </Link>
        </div>
      </div>
      <SignUpForm />
    </section>
  );
}
