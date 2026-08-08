import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "PLAYER";
    };
  }

  interface User {
    role?: "ADMIN" | "PLAYER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "PLAYER";
  }
}
