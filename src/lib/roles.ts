export type AppRole = "ADMIN" | "PLAYER";

export function getDashboardHref(role: AppRole) {
  return role === "ADMIN" ? "/admin" : "/player";
}

export function isAdminRole(role: string | undefined): role is "ADMIN" {
  return role === "ADMIN";
}

export function isPlayerRole(role: string | undefined): role is "PLAYER" {
  return role === "PLAYER";
}
