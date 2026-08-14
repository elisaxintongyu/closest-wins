import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function AdminGameLoading() {
  return (
    <LoadingShell
      eyebrow="Question management"
      title="Loading game controls"
      description="Fetching your question set, round state, and game history so the control panel can render."
      sidebarTitle="Overview"
    />
  );
}
