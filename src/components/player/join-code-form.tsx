type JoinCodeFormProps = {
  defaultJoinCode?: string;
};

export function JoinCodeForm({ defaultJoinCode = "" }: JoinCodeFormProps) {
  return (
    <form
      action="/player"
      className="space-y-5 rounded-[1.75rem] border border-stone-900/10 bg-white p-5 shadow-[0_18px_60px_rgba(120,53,15,0.08)]"
    >
      <div className="space-y-2">
        <label
          htmlFor="lookup-join-code"
          className="text-sm font-semibold tracking-[0.12em] text-stone-700 uppercase"
        >
          Game join code
        </label>
        <input
          id="lookup-join-code"
          name="joinCode"
          type="text"
          maxLength={6}
          defaultValue={defaultJoinCode}
          placeholder="AB12CD"
          className="w-full rounded-2xl border border-stone-300 px-4 py-3 font-mono text-lg tracking-[0.3em] uppercase"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
      >
        Find game
      </button>
    </form>
  );
}
