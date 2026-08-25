"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { createSaleReturn } from "@/lib/actions/returns";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Select, Textarea } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils";

type SaleOption = {
  id: string;
  invoiceNo: string;
  customerName: string;
  items: { partId: string; partName: string; partCode: string; quantity: number; unitPrice: number }[];
};

export function ReturnForm({ sales }: { sales: SaleOption[] }) {
  const [state, formAction] = useFormState<FormState, FormData>(createSaleReturn, undefined);
  const [saleId, setSaleId] = useState("");
  const [qtyByPart, setQtyByPart] = useState<Record<string, number>>({});

  const selectedSale = useMemo(() => sales.find((s) => s.id === saleId), [saleId, sales]);

  const items = useMemo(() => {
    if (!selectedSale) return [];
    return Object.entries(qtyByPart)
      .filter(([, qty]) => qty > 0)
      .map(([partId, qty]) => {
        const line = selectedSale.items.find((i) => i.partId === partId)!;
        return { partId, quantity: qty, amount: qty * line.unitPrice };
      });
  }, [qtyByPart, selectedSale]);

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  function setQty(partId: string, value: number, max: number) {
    setQtyByPart((prev) => ({ ...prev, [partId]: Math.max(0, Math.min(value, max)) }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />
      <FormError message={state?.error} />

      <Card className="p-6">
        <FormField label="Original Invoice" htmlFor="saleId" required>
          <Select
            id="saleId"
            name="saleId"
            required
            value={saleId}
            onChange={(e) => {
              setSaleId(e.target.value);
              setQtyByPart({});
            }}
          >
            <option value="" disabled>Select invoice</option>
            {sales.map((s) => (
              <option key={s.id} value={s.id}>{s.invoiceNo} — {s.customerName}</option>
            ))}
          </Select>
        </FormField>
      </Card>

      {selectedSale && (
        <Card>
          <CardHeader title="Select Parts to Return" />
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="pb-2 pr-2 font-medium">Part</th>
                  <th className="pb-2 px-2 font-medium">Sold Qty</th>
                  <th className="pb-2 px-2 font-medium w-28">Return Qty</th>
                  <th className="pb-2 px-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item) => (
                  <tr key={item.partId} className="border-t border-slate-100">
                    <td className="py-2 pr-2">
                      <p className="font-medium text-slate-900">{item.partName}</p>
                      <p className="text-xs text-slate-400">{item.partCode}</p>
                    </td>
                    <td className="py-2 px-2 text-slate-600">{item.quantity}</td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={qtyByPart[item.partId] ?? 0}
                        onChange={(e) => setQty(item.partId, Number(e.target.value), item.quantity)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-slate-900">
                      {formatMoney((qtyByPart[item.partId] ?? 0) * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <span className="text-sm text-slate-500">Total Refund Amount</span>
            <span className="text-lg font-semibold text-slate-900">{formatMoney(total)}</span>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <FormField label="Reason for Return" htmlFor="reason">
          <Textarea id="reason" name="reason" rows={3} placeholder="e.g. Wrong part, defective item, customer changed mind" />
        </FormField>
      </Card>

      <div className="flex gap-2">
        <SubmitButton>Save Return</SubmitButton>
        <LinkButton href="/returns" variant="secondary">Cancel</LinkButton>
      </div>
    </form>
  );
}
