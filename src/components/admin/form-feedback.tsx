"use client";

// Renders reusable admin form validation and status feedback.

import type { ActionState } from "@/lib/admin-validation";

type FormFeedbackProps = {
  state: ActionState;
  field: string;
};

export function FieldErrors({ state, field }: FormFeedbackProps) {
  const messages = state.fieldErrors?.[field];

  if (!messages?.length) {
    return null;
  }

  return (
    <ul className="space-y-1 text-sm text-red-700">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message || state.status === "idle") {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "text-sm text-green-700"
          : "text-sm text-red-700"
      }
    >
      {state.message}
    </p>
  );
}
