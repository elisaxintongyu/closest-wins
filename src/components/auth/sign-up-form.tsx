"use client";

import { useActionState } from "react";
import { register, type AuthFormState } from "@/app/(auth)/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [state, formAction] = useActionState(register, initialState);

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-stone-900/10 bg-stone-50/80 p-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
          Create your player account
        </h2>
        <p className="text-sm leading-7 text-stone-600">
          New accounts default to the player role.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Name
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm text-stone-900 transition outline-none focus:border-stone-500"
            placeholder="Taylor Player"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm text-stone-900 transition outline-none focus:border-stone-500"
            placeholder="player@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-sm text-stone-900 transition outline-none focus:border-stone-500"
            placeholder="At least 8 characters"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6">
        <AuthSubmitButton
          idleLabel="Create account"
          pendingLabel="Creating account..."
        />
      </div>
    </form>
  );
}
