import { auth, currentUser } from "@clerk/nextjs/server";
import { getDashboardHref } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type GuardedSession = {
  role: "ADMIN" | "PLAYER";
  userName: string;
  email: string;
  databaseUserId: string | null;
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
    select: { id: true, role: true, name: true, email: true },
  });

  const role = dbUser?.role ?? "PLAYER";
  const userName = user?.fullName ?? dbUser?.name ?? email;

  return {
    role,
    userName,
    email,
    databaseUserId: dbUser?.id ?? null,
  };
}

export async function requireRole(role: "ADMIN" | "PLAYER") {
  const session = await requireSession();

  if (session.role !== role) {
    redirect(getDashboardHref(session.role));
  }

  return session;
}

export async function syncDatabaseUser(session: GuardedSession) {
  if (session.databaseUserId) {
    return prisma.user.update({
      where: { id: session.databaseUserId },
      data: {
        name: session.userName,
      },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
      },
    });
  }

  return prisma.user.upsert({
    where: {
      email: session.email,
    },
    update: {
      name: session.userName,
    },
    create: {
      email: session.email,
      name: session.userName,
      role: session.role,
    },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
    },
  });
}
