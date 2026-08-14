// Shows the root-level loading state while app routes stream in.
import { LoadingShell } from "@/components/dashboard/loading-shell";

export default function Loading() {
  return (
    <LoadingShell
      eyebrow="Loading"
      title="Preparing Closest Wins"
      description="We’re loading the current route and checking your session so the right game view can render."
      sidebarTitle="Please wait"
    />
  );
}
