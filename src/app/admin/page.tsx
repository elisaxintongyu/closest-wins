import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Admin";

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Manage the game data layer."
      description="This is the administrator landing page. The role model exists now, and the next branch in the stack will enforce stricter route protection."
      userName={userName}
      roleLabel="Administrator"
      highlights={[
        "Backed by Prisma users with an ADMIN role",
        "Ready for Milestone 3 question management flows",
        "Strict authorization enforcement lands in the next branch",
      ]}
    />
  );
}
