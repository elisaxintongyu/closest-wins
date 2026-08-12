import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closest Wins",
  description:
    "A production-ready Next.js starter for the Closest Wins project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
