import { auth, currentUser } from "@clerk/nextjs/server";
import { getDashboardHref } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { getE2ETestSession, isE2ETestModeEnabled } from "@/lib/test-mode";
import { redirect } from "next/navigation";

export type GuardedSession = {
  role: "ADMIN" | "PLAYER";
  userName: string;
  email: string;
  databaseUserId: string | null;
};

export async function getOptionalSession(): Promise<GuardedSession | null> {
  const testSession = await getE2ETestSession();

  if (testSession) {
    const dbUser = await prisma.user.findUnique({
      where: { email: testSession.email },
      select: { id: true, role: true, name: true, email: true },
    });

    return {
      role: dbUser?.role ?? testSession.role,
      userName: dbUser?.name ?? testSession.name,
      email: dbUser?.email ?? testSession.email,
      databaseUserId: dbUser?.id ?? null,
    };
  }

  if (isE2ETestModeEnabled()) {
    return null;
  }

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!email) {
    return null;
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

export async function requireSession(): Promise<GuardedSession> {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
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
