import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  E2E_TEST_SESSION_COOKIE,
  encodeE2ETestSession,
  isE2ETestModeEnabled,
  type E2ETestRole,
} from "@/lib/test-mode";

function forbiddenResponse() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

function normalizeRole(value: FormDataEntryValue | null): E2ETestRole | null {
  return value === "ADMIN" || value === "PLAYER" ? value : null;
}

function normalizeRedirect(value: FormDataEntryValue | null) {
  const redirectTo = typeof value === "string" ? value.trim() : "";
  return redirectTo.startsWith("/") ? redirectTo : "/dashboard";
}

export async function POST(request: Request) {
  if (!isE2ETestModeEnabled()) {
    return forbiddenResponse();
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "sign-out") {
    const cookieStore = await cookies();
    cookieStore.delete(E2E_TEST_SESSION_COOKIE);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const emailValue = formData.get("email");
  const nameValue = formData.get("name");
  const role = normalizeRole(formData.get("role"));

  if (
    typeof emailValue !== "string" ||
    typeof nameValue !== "string" ||
    !role
  ) {
    return NextResponse.json(
      { error: "Missing test session fields." },
      { status: 400 }
    );
  }

  const email = emailValue.trim().toLowerCase();
  const name = nameValue.trim();

  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and name are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
    },
    create: {
      email,
      name,
      role,
    },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    E2E_TEST_SESSION_COOKIE,
    encodeE2ETestSession({
      email: user.email,
      name: user.name ?? name,
      role: user.role,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }
  );

  return NextResponse.redirect(new URL(normalizeRedirect(formData.get("redirectTo")), request.url));
}
