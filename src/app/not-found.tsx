import { RouteStateCard } from "@/components/dashboard/route-state-card";

export default function NotFound() {
  return (
    <RouteStateCard
      eyebrow="Page not found"
      title="That page is not available."
      description="The link may be outdated, the game may no longer exist, or your account may not have access to this route."
      primaryHref="/dashboard"
      primaryLabel="Go to dashboard"
      secondaryHref="/sign-in"
      secondaryLabel="Sign in again"
    />
  );
}
