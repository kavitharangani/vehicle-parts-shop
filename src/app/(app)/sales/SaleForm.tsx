"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { createSale } from "@/lib/actions/sales";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import type { Customer, Vehicle } from "@prisma/client";

type Row = { partId: string; quantity: number; unitPrice: number; discount: number };
export type PlainPart = { id: string; partCode: string; partName: string; sellingPrice: number; quantity: number };

export function SaleForm({
  customers,
  vehicles,
  parts,
}: {
  customers: Customer[];
  vehicles: Vehicle[];
  parts: PlainPart[];
}) {
  const [state, formAction] = useFormState<FormState, FormData>(createSale, undefined);
  const [customerId, setCustomerId] = useState("");
  const [rows, setRows] = useState<Row[]>([{ partId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const availableVehicles = useMemo(
    () => (customerId ? vehicles.filter((v) => v.customerId === customerId) : vehicles),
    [customerId, vehicles]
  );

  const subtotal = useMemo(
    () => rows.reduce((sum, r) => sum + (r.quantity * r.unitPrice - r.discount), 0),
    [rows]
  );
  const grandTotal = Math.max(subtotal - overallDiscount, 0);
  const balance = Math.max(grandTotal - paidAmount, 0);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { partId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const validItems = rows.filter((r) => r.partId && r.quantity > 0);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="itemsJson" value={JSON.stringify(validItems)} />
      <input type="hidden" name="discount" value={overallDiscount} />
      <input type="hidden" name="paidAmount" value={paidAmount} />
      <FormError message={state?.error} />

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Customer" htmlFor="customerId">
            <Select id="customerId" name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Vehicle" htmlFor="vehicleId">
            <Select id="vehicleId" name="vehicleId" defaultValue="">
              <option value="">-- None --</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand} {v.model})</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Items"
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
                <th className="pb-2 px-2 font-medium w-24">Qty</th>
                <th className="pb-2 px-2 font-medium w-28">Unit Price</th>
                <th className="pb-2 px-2 font-medium w-24">Discount</th>
                <th className="pb-2 px-2 font-medium w-28 text-right">Total</th>
                <th className="pb-2 pl-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const part = parts.find((p) => p.id === row.partId);
                return (
                  <tr key={idx} className="border-t border-slate-100 align-top">
                    <td className="py-2 pr-2">
                      <Select
                        value={row.partId}
                        onChange={(e) => {
                          const p = parts.find((pp) => pp.id === e.target.value);
                          updateRow(idx, { partId: e.target.value, unitPrice: p ? Number(p.sellingPrice) : 0 });
                        }}
                      >
                        <option value="">Select part</option>
                        {parts.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.partCode} — {p.partName} (stock: {p.quantity})
                          </option>
                        ))}
                      </Select>
                      {part && row.quantity > part.quantity && (
                        <p className="mt-1 text-xs text-red-500">Only {part.quantity} in stock</p>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <Input type="number" min={1} max={part?.quantity} value={row.quantity} onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 px-2">
                      <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => updateRow(idx, { unitPrice: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 px-2">
                      <Input type="number" min={0} step="0.01" value={row.discount} onChange={(e) => updateRow(idx, { discount: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-slate-900">
                      {formatMoney(row.quantity * row.unitPrice - row.discount)}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <button type="button" onClick={() => removeRow(idx)} disabled={rows.length === 1} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField label="Payment Method" htmlFor="paymentMethod">
              <Select id="paymentMethod" name="paymentMethod" defaultValue="CASH">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT">Credit (Pay Later)</option>
              </Select>
            </FormField>
            <FormField label="Overall Discount (Rs.)" htmlFor="discountDisplay">
              <Input id="discountDisplay" type="number" min={0} step="0.01" value={overallDiscount} onChange={(e) => setOverallDiscount(Number(e.target.value))} />
            </FormField>
            <FormField label="Paid Amount (Rs.)" htmlFor="paidAmountDisplay">
              <Input id="paidAmountDisplay" type="number" min={0} step="0.01" max={grandTotal} value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
            </FormField>
          </div>
          <div className="space-y-2 rounded-md bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {formatMoney(overallDiscount)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold"><span>Grand Total</span><span>{formatMoney(grandTotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Paid</span><span>{formatMoney(paidAmount)}</span></div>
            <div className="flex justify-between font-medium text-amber-600"><span>Balance</span><span>{formatMoney(balance)}</span></div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <SubmitButton>Complete Sale</SubmitButton>
        <LinkButton href="/sales" variant="secondary">Cancel</LinkButton>
      </div>
    </form>
  );
}
