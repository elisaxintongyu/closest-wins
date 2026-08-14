// Shows the loading state while a player game page is fetched.
import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function PlayerGameLoading() {
  return (
    <LoadingShell
      eyebrow="Player game"
      title="Loading your team page"
      description="Fetching the active round, your team details, and the latest scoreboard."
      sidebarTitle="Standings"
    />
  );
}
