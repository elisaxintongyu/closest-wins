"use client";

import Link from "next/link";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-4 py-6 text-stone-950 sm:px-6 sm:py-12">
      <section className="w-full max-w-2xl rounded-[2rem] border border-stone-900/10 bg-white/85 p-6 shadow-[0_28px_90px_rgba(120,53,15,0.14)] backdrop-blur sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-stone-500 uppercase">
          Admin error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
          The admin view could not finish loading.
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-700">
          Retry to reload your game data, or return to the admin dashboard and
          reopen the game you were managing.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Back to admin page
          </Link>
        </div>
      </section>
    </main>
  );
}
