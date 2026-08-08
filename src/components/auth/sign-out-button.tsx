import { logout } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
      >
        Sign out
      </button>
    </form>
  );
}
