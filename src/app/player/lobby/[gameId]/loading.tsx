import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function PlayerLobbyLoading() {
  return (
    <LoadingShell
      eyebrow="Game lobby"
      title="Loading the lobby"
      description="Gathering the team list, active round, and revealed results for this session."
      sidebarTitle="Next steps"
    />
  );
}
