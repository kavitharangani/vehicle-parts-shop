"use client";

import { useTransition } from "react";
import { toggleUserActive } from "@/lib/actions/users";

export function ToggleActiveButton({ userId, active }: { userId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleUserActive(userId))}
      className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
    >
      {active ? "Disable" : "Enable"}
    </button>
  );
}
