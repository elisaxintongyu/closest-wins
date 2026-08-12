import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Manage the game data layer."
      description="This protected route is reserved for administrators. It acts as the role-specific entry point for question management and future game setup work."
      userName={session.userName}
      roleLabel="Administrator"
      highlights={[
        "Protected by Clerk auth and server-side role guards",
        "Backed by Prisma users with an ADMIN role",
        "Ready for Milestone 3 question management flows",
      ]}
    />
  );
}
