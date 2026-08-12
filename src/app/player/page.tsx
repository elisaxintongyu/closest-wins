import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PlayerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Player";

  return (
    <DashboardShell
      eyebrow="Player dashboard"
      title="You’re signed in and ready for gameplay."
      description="This is the player landing page. The role model exists now, and the next branch in the stack will tighten route access based on those roles."
      userName={userName}
      roleLabel="Player"
      highlights={[
        "New sign-ups default to the PLAYER role",
        "Stored in PostgreSQL via Prisma",
        "Ready for Milestones 4 and 5 player/team and gameplay flows",
      ]}
    />
  );
}
