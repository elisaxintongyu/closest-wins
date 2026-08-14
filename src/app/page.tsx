// Routes visitors to the correct landing destination based on session state.
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth-guards";
import { getDashboardHref } from "@/lib/roles";

export default async function HomePage() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/sign-in");
  }

  redirect(getDashboardHref(session.role));
}
