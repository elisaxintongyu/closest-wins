// Shows the loading state while the player dashboard is fetched.
import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function PlayerLoading() {
  return (
    <LoadingShell
      eyebrow="Player dashboard"
      title="Loading your player view"
      description="Looking up your joined games, join-code results, and active team pages."
      sidebarTitle="Your pages"
    />
  );
}
