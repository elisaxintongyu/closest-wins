import { auth, currentUser } from "@clerk/nextjs/server";
import { getDashboardHref } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!email) {
    redirect("/player");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  redirect(getDashboardHref(dbUser?.role ?? "PLAYER"));
}
