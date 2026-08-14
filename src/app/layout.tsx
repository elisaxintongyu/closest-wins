import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isE2ETestModeEnabled } from "@/lib/test-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closest Wins",
  description:
    "A production-ready Next.js starter for the Closest Wins project.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );

  if (isE2ETestModeEnabled()) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  );
}
