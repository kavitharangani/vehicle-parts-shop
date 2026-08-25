"use client";

import { useFormState } from "react-dom";
import { addPayment } from "@/lib/actions/sales";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function PaymentForm({ saleId, balance }: { saleId: string; balance: number }) {
  const action = addPayment.bind(null, saleId);
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <FormField label={`Amount (outstanding: ${balance.toFixed(2)})`} htmlFor="amount" required>
        <Input id="amount" name="amount" type="number" min={0.01} max={balance} step="0.01" required />
      </FormField>
      <FormField label="Payment Method" htmlFor="paymentMethod" required>
        <Select id="paymentMethod" name="paymentMethod" defaultValue="CASH">
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </Select>
      </FormField>
      <SubmitButton className="w-full">Record Payment</SubmitButton>
    </form>
  );
}
