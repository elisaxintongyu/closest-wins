"use client";

import { useActionState } from "react";
import { createGame } from "@/app/admin/actions";
import { FieldErrors, FormMessage } from "@/components/admin/form-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialActionState } from "@/lib/admin-validation";

export function CreateGameForm() {
  const [state, formAction] = useActionState(createGame, initialActionState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border p-4 sm:p-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="game-title"
          className="text-sm font-medium text-stone-900"
        >
          Game title
        </label>
        <input
          id="game-title"
          name="title"
          type="text"
          placeholder="Hacknight Round 1"
          className="w-full rounded-lg border px-3 py-2"
        />
        <FieldErrors state={state} field="title" />
      </div>

      <FormMessage state={state} />

      <SubmitButton
        pendingLabel="Creating game..."
        className="min-h-11 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        style={{ color: "#fff" }}
      >
        Create game
      </SubmitButton>
    </form>
  );
}
