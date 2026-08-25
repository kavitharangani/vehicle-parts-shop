"use client";

import { useFormState } from "react-dom";
import { createVehicle, updateVehicle } from "@/lib/actions/vehicles";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Vehicle, Customer } from "@prisma/client";

export function VehicleForm({
  vehicle,
  customers,
}: {
  vehicle?: Vehicle;
  customers: Customer[];
}) {
  const action = vehicle ? updateVehicle.bind(null, vehicle.id) : createVehicle;
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <Card className="max-w-xl p-6">
      <form action={formAction} className="space-y-4">
        <FormError message={state?.error} />
        <FormField label="Vehicle Number" htmlFor="vehicleNumber" required>
          <Input id="vehicleNumber" name="vehicleNumber" placeholder="e.g. WP CAB-1234" defaultValue={vehicle?.vehicleNumber} required />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Brand" htmlFor="brand" required>
            <Input id="brand" name="brand" placeholder="e.g. Toyota" defaultValue={vehicle?.brand} required />
          </FormField>
          <FormField label="Model" htmlFor="model" required>
            <Input id="model" name="model" placeholder="e.g. Aqua" defaultValue={vehicle?.model} required />
          </FormField>
        </div>
        <FormField label="Year" htmlFor="year">
          <Input id="year" name="year" type="number" min={1950} max={2100} defaultValue={vehicle?.year ?? ""} />
        </FormField>
        <FormField label="Owner (Customer)" htmlFor="customerId">
          <Select id="customerId" name="customerId" defaultValue={vehicle?.customerId ?? ""}>
            <option value="">-- Unassigned --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
        <div className="flex gap-2 pt-2">
          <SubmitButton>{vehicle ? "Save Changes" : "Add Vehicle"}</SubmitButton>
          <LinkButton href="/vehicles" variant="secondary">Cancel</LinkButton>
        </div>
      </form>
    </Card>
  );
}
