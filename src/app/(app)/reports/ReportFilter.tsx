"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ReportFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/reports?from=${fromDate}&to=${toDate}`);
      }}
      className="flex items-end gap-2"
    >
      <div>
        <label className="mb-1 block text-xs text-slate-500">From</label>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">To</label>
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
      </div>
      <Button type="submit" variant="secondary">Apply</Button>
    </form>
  );
}
