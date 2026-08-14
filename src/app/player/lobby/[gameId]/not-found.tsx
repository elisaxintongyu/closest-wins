// Shows the missing-lobby state when a player cannot access a lobby.
import { RouteStateCard } from "@/components/dashboard/route-state-card";

export default function PlayerLobbyNotFound() {
  return (
    <RouteStateCard
      eyebrow="Lobby not found"
      title="You cannot open this lobby."
      description="The lobby may have been removed, or your account may not be part of this game."
      primaryHref="/player"
      primaryLabel="Back to player page"
      secondaryHref="/sign-in"
      secondaryLabel="Sign in again"
    />
  );
}
