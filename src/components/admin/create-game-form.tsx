import { createGame } from "@/app/admin/actions";

export function CreateGameForm() {
  return (
    <form action={createGame} className="space-y-4 rounded-2xl border p-4">
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
          required
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
      >
        Create game
      </button>
    </form>
  );
}
