import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function DashboardLoading() {
  return (
    <LoadingShell
      eyebrow="Redirecting"
      title="Sending you to the right dashboard"
      description="Checking your role so we can route you to the correct admin or player page."
      sidebarTitle="Session"
    />
  );
}
