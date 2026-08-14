import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-4 py-6 text-stone-950 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center sm:min-h-[calc(100vh-6rem)]">
        {children}
      </div>
    </main>
  );
}
