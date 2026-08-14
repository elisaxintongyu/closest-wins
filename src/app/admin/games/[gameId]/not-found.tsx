import { RouteStateCard } from "@/components/dashboard/route-state-card";

export default function AdminGameNotFound() {
  return (
    <RouteStateCard
      eyebrow="Admin game not found"
      title="This game is missing or not yours to manage."
      description="The game may have been deleted, or you may be signed in with a different admin account than the one that created it."
      primaryHref="/admin"
      primaryLabel="Back to admin page"
      secondaryHref="/sign-in"
      secondaryLabel="Sign in again"
    />
  );
}
