// Shows the missing-game state when a player cannot open a game page.
import { RouteStateCard } from "@/components/dashboard/route-state-card";

export default function PlayerGameNotFound() {
  return (
    <RouteStateCard
      eyebrow="Player game not found"
      title="You do not have access to this game page."
      description="This game may not exist anymore, or your account may not belong to a team in this session."
      primaryHref="/player"
      primaryLabel="Back to player page"
      secondaryHref="/sign-in"
      secondaryLabel="Sign in again"
    />
  );
}
