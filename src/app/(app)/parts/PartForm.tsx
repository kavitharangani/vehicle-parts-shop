"use client";

import { useFormState } from "react-dom";
import { createPart, updatePart } from "@/lib/actions/parts";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Category, Vehicle, Supplier } from "@prisma/client";

/** Plain, client-serializable shape (Decimal fields converted to number). */
export type PlainPart = {
  id: string;
  partCode: string;
  partName: string;
  categoryId: string | null;
  vehicleId: string | null;
  compatibleVehicle: string | null;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  supplierId: string | null;
};

export function PartForm({
  part,
  categories,
  vehicles,
  suppliers,
}: {
  part?: PlainPart;
  categories: Category[];
  vehicles: Vehicle[];
  suppliers: Supplier[];
}) {
  const action = part ? updatePart.bind(null, part.id) : createPart;
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <Card className="max-w-2xl p-6">
      <form action={formAction} className="space-y-4">
        <FormError message={state?.error} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Part Code" htmlFor="partCode" required>
            <Input id="partCode" name="partCode" placeholder="e.g. BRK-2201" defaultValue={part?.partCode} required />
          </FormField>
          <FormField label="Part Name" htmlFor="partName" required>
            <Input id="partName" name="partName" placeholder="e.g. Front Brake Pad" defaultValue={part?.partName} required />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" htmlFor="categoryId">
            <Select id="categoryId" name="categoryId" defaultValue={part?.categoryId ?? ""}>
              <option value="">-- None --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Supplier" htmlFor="supplierId">
            <Select id="supplierId" name="supplierId" defaultValue={part?.supplierId ?? ""}>
              <option value="">-- None --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Specific Compatible Vehicle" htmlFor="vehicleId">
          <Select id="vehicleId" name="vehicleId" defaultValue={part?.vehicleId ?? ""}>
            <option value="">-- None --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand} {v.model})</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Other Compatible Vehicles (free text)" htmlFor="compatibleVehicle">
          <Textarea
            id="compatibleVehicle"
            name="compatibleVehicle"
            rows={2}
            placeholder="e.g. Toyota Aqua, Prius, Corolla Axio (2012-2018)"
            defaultValue={part?.compatibleVehicle ?? ""}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Buying Price (Rs.)" htmlFor="buyingPrice" required>
            <Input id="buyingPrice" name="buyingPrice" type="number" step="0.01" min={0} defaultValue={part?.buyingPrice} required />
          </FormField>
          <FormField label="Selling Price (Rs.)" htmlFor="sellingPrice" required>
            <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" min={0} defaultValue={part?.sellingPrice} required />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={part ? "Stock Quantity" : "Opening Stock Quantity"} htmlFor="quantity" required>
            <Input id="quantity" name="quantity" type="number" min={0} defaultValue={part?.quantity ?? 0} required />
          </FormField>
          <FormField label="Reorder Level" htmlFor="reorderLevel" required>
            <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={part?.reorderLevel ?? 5} required />
          </FormField>
        </div>

        <div className="flex gap-2 pt-2">
          <SubmitButton>{part ? "Save Changes" : "Add Part"}</SubmitButton>
          <LinkButton href="/parts" variant="secondary">Cancel</LinkButton>
        </div>
      </form>
    </Card>
  );
}
