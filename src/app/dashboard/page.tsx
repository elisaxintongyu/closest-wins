import { requireSession } from "@/lib/auth-guards";
import { getDashboardHref } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await requireSession();
  redirect(getDashboardHref(session.role));
}
