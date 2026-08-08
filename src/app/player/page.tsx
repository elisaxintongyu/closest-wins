import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export default async function PlayerPage() {
  const session = await requireRole("PLAYER");

  return (
    <DashboardShell
      eyebrow="Player dashboard"
      title="You’re signed in and ready for gameplay."
      description="This protected route is the player landing area. It confirms role-based access is working and gives the game flow a dedicated home for the next milestones."
      userName={session.userName}
      roleLabel="Player"
      highlights={[
        "Created through the sign-up flow or the seed script",
        "Stored in PostgreSQL via Prisma",
        "Ready for Milestones 4 and 5 player/team and gameplay flows",
      ]}
    />
  );
}
