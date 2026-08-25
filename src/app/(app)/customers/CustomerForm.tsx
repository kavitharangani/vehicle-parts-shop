"use client";

import { useFormState } from "react-dom";
import { createCustomer, updateCustomer, type FormState } from "@/lib/actions/customers";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Customer } from "@prisma/client";

export function CustomerForm({ customer }: { customer?: Customer }) {
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <Card className="max-w-xl p-6">
      <form action={formAction} className="space-y-4">
        <FormError message={state?.error} />
        <FormField label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={customer?.name} required />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
        </FormField>
        <FormField label="Address" htmlFor="address">
          <Textarea id="address" name="address" rows={3} defaultValue={customer?.address ?? ""} />
        </FormField>
        <div className="flex gap-2 pt-2">
          <SubmitButton>{customer ? "Save Changes" : "Add Customer"}</SubmitButton>
          <LinkButton href="/customers" variant="secondary">Cancel</LinkButton>
        </div>
      </form>
    </Card>
  );
}
