import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8eb_0%,_#fff1d6_100%)] px-6 py-12 text-stone-950">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
