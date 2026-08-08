import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
