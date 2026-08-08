import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closest Wins",
  description: "Project setup for the Closest Wins game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
