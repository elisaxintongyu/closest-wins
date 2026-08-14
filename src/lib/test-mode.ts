import { cookies } from "next/headers";

export const E2E_TEST_SESSION_COOKIE = "closest-wins-e2e-session";

export type E2ETestRole = "ADMIN" | "PLAYER";

export type E2ETestSession = {
  email: string;
  name: string;
  role: E2ETestRole;
};

export function isE2ETestModeEnabled() {
  return process.env.E2E_TEST_MODE === "true";
}

export function encodeE2ETestSession(session: E2ETestSession) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeE2ETestSession(
  value: string | undefined
): E2ETestSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<E2ETestSession>;

    if (
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      (parsed.role !== "ADMIN" && parsed.role !== "PLAYER")
    ) {
      return null;
    }

    return {
      email: parsed.email.trim().toLowerCase(),
      name: parsed.name.trim(),
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getE2ETestSession() {
  if (!isE2ETestModeEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  return decodeE2ETestSession(cookieStore.get(E2E_TEST_SESSION_COOKIE)?.value);
}
