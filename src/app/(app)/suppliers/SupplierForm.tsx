"use client";

import { useFormState } from "react-dom";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Supplier } from "@prisma/client";

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const action = supplier ? updateSupplier.bind(null, supplier.id) : createSupplier;
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <Card className="max-w-xl p-6">
      <form action={formAction} className="space-y-4">
        <FormError message={state?.error} />
        <FormField label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={supplier?.name} required />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} />
        </FormField>
        <FormField label="Address" htmlFor="address">
          <Textarea id="address" name="address" rows={3} defaultValue={supplier?.address ?? ""} />
        </FormField>
        <div className="flex gap-2 pt-2">
          <SubmitButton>{supplier ? "Save Changes" : "Add Supplier"}</SubmitButton>
          <LinkButton href="/suppliers" variant="secondary">Cancel</LinkButton>
        </div>
      </form>
    </Card>
  );
}
