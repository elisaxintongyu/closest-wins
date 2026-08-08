import { auth, currentUser } from "@clerk/nextjs/server";
import { getDashboardHref } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type GuardedSession = {
  role: "ADMIN" | "PLAYER";
  userName: string;
  email: string;
};

export async function requireSession(): Promise<GuardedSession> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!email) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true, name: true, email: true },
  });

  const role = dbUser?.role ?? "PLAYER";
  const userName = user?.fullName ?? dbUser?.name ?? email;

  return {
    role,
    userName,
    email,
  };
}

export async function requireRole(role: "ADMIN" | "PLAYER") {
  const session = await requireSession();

  if (session.role !== role) {
    redirect(getDashboardHref(session.role));
  }

  return session;
}
