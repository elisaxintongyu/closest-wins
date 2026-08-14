import Link from "next/link";

type RouteStateCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function RouteStateCard({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: RouteStateCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-4 py-6 text-stone-950 sm:px-6 sm:py-12">
      <section className="w-full max-w-2xl rounded-[2rem] border border-stone-900/10 bg-white/85 p-6 shadow-[0_28px_90px_rgba(120,53,15,0.14)] backdrop-blur sm:p-8">
        <p className="text-xs font-semibold tracking-[0.24em] text-stone-500 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-700">{description}</p>

        {primaryHref || secondaryHref ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {primaryHref && primaryLabel ? (
              <Link
                href={primaryHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                style={{ color: "#fff" }}
              >
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-900/10 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
