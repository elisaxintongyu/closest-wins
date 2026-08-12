import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

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
            This route now uses Clerk to handle registration, verification, and
            session creation for the app.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Already have an account?
          </p>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Return to sign in with the same Clerk account on any device or
            browser.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Go to sign in
          </Link>
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-stone-900/10 bg-stone-50/80 p-6">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>
    </section>
  );
}
