import type { PlayerActionState } from "@/lib/player-validation";

export function PlayerFieldErrors({
  state,
  field,
}: {
  state: PlayerActionState;
  field: string;
}) {
  const errors = state.fieldErrors?.[field];

  if (!errors?.length) {
    return null;
  }

  return (
    <ul className="space-y-1 text-sm text-red-700">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

export function PlayerFormMessage({ state }: { state: PlayerActionState }) {
  if (!state.message) {
    return null;
  }

  const tone =
    state.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${tone}`}>
      {state.message}
    </p>
  );
}
