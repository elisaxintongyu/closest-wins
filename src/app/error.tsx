"use client";

// Shows the root-level recoverable error state for the app shell.

import { RouteStateCard } from "@/components/dashboard/route-state-card";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <RouteStateCard
          eyebrow="Something went wrong"
          title="We hit an unexpected error."
          description="Refresh the page or head back to your dashboard. If this keeps happening, retry the action that brought you here."
          primaryHref="/dashboard"
          primaryLabel="Back to dashboard"
          secondaryHref="/sign-in"
          secondaryLabel="Sign in again"
        />
      </body>
    </html>
  );
}
