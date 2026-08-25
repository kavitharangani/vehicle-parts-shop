"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { createPurchase } from "@/lib/actions/purchases";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import type { Supplier } from "@prisma/client";

type Row = { partId: string; quantity: number; unitPrice: number };
export type PlainPart = { id: string; partCode: string; partName: string; buyingPrice: number; quantity: number };

export function PurchaseForm({ suppliers, parts }: { suppliers: Supplier[]; parts: PlainPart[] }) {
  const [state, formAction] = useFormState<FormState, FormData>(createPurchase, undefined);
  const [rows, setRows] = useState<Row[]>([{ partId: "", quantity: 1, unitPrice: 0 }]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0), [rows]);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { partId: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const validItems = rows.filter((r) => r.partId && r.quantity > 0);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="itemsJson" value={JSON.stringify(validItems)} />
      <FormError message={state?.error} />

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Supplier" htmlFor="supplierId" required>
            <Select id="supplierId" name="supplierId" required defaultValue="">
              <option value="" disabled>Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Supplier Invoice No. (optional)" htmlFor="invoiceNo">
            <Input id="invoiceNo" name="invoiceNo" placeholder="Auto-generated if left blank" />
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Parts Purchased"
          action={
            <button type="button" onClick={addRow} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
              <Plus size={14} /> Add Row
            </button>
          }
        />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="pb-2 pr-2 font-medium">Part</th>
                <th className="pb-2 px-2 font-medium w-28">Quantity</th>
                <th className="pb-2 px-2 font-medium w-32">Unit Price</th>
                <th className="pb-2 px-2 font-medium w-32 text-right">Total</th>
                <th className="pb-2 pl-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100">
                  <td className="py-2 pr-2">
                    <Select
                      value={row.partId}
                      onChange={(e) => {
                        const part = parts.find((p) => p.id === e.target.value);
                        updateRow(idx, {
                          partId: e.target.value,
                          unitPrice: part ? Number(part.buyingPrice) : row.unitPrice,
                        });
                      }}
                    >
                      <option value="">Select part</option>
                      {parts.map((p) => (
                        <option key={p.id} value={p.id}>{p.partCode} — {p.partName}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="py-2 px-2">
                    <Input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })} />
                  </td>
                  <td className="py-2 px-2">
                    <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => updateRow(idx, { unitPrice: Number(e.target.value) })} />
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-slate-900">
                    {formatMoney(row.quantity * row.unitPrice)}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button type="button" onClick={() => removeRow(idx)} disabled={rows.length === 1} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <span className="text-sm text-slate-500">Total Amount</span>
          <span className="text-lg font-semibold text-slate-900">{formatMoney(total)}</span>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Paid Amount (Rs.)" htmlFor="paidAmount">
            <Input id="paidAmount" name="paidAmount" type="number" min={0} step="0.01" max={total} defaultValue={0} />
          </FormField>
          <div className="flex items-end">
            <p className="text-sm text-slate-500">
              Balance to supplier: <span className="font-medium text-slate-900">calculated on save</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <SubmitButton>Save Purchase</SubmitButton>
        <LinkButton href="/purchases" variant="secondary">Cancel</LinkButton>
      </div>
    </form>
  );
}
