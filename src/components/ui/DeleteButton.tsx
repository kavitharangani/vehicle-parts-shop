"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmText = "Delete this record? This cannot be undone.",
}: {
  action: () => Promise<void>;
  confirmText?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title="Delete"
      disabled={isPending}
      onClick={() => {
        if (!confirm(confirmText)) return;
        startTransition(async () => {
          try {
            await action();
          } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete.");
          }
        });
      }}
      className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
