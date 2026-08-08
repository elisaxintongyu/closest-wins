"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../../../auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthFormState = {
  error?: string;
};

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsedCredentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      error:
        parsedCredentials.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "That email and password combination did not match."
            : "Unable to sign in right now.",
      };
    }

    throw error;
  }

  return {};
}

export async function register(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsedRegistration = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedRegistration.success) {
    return {
      error:
        parsedRegistration.error.issues[0]?.message ??
        "Unable to create that account.",
    };
  }

  const { email, name, password } = parsedRegistration.data;
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
    };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Your account was created, but automatic sign-in failed.",
      };
    }

    throw error;
  }

  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
