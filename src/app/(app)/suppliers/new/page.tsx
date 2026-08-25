import { SupplierForm } from "../SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Add Supplier</h1>
      <SupplierForm />
    </div>
  );
}
