import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Run Closest Wins from one control room."
      description="This milestone turns the admin route into the dedicated home for managing game sessions and question content."
      userName={session.userName}
      roleLabel="Administrator"
      highlights={[
        "A protected admin-only entry point for game management",
        "A dedicated workspace for upcoming game setup flows",
        "A clear foundation for question management in the next issues",
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            Game management
          </h2>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            Admins will create game sessions here and track the state of each
            live event.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            Question management
          </h2>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            This dashboard is the future home for creating, editing, and
            ordering each game&apos;s question set.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
