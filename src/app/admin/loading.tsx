import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function AdminLoading() {
  return (
    <LoadingShell
      eyebrow="Admin dashboard"
      title="Loading your admin workspace"
      description="Fetching your games, round summaries, and management tools."
      sidebarTitle="Game history"
    />
  );
}
