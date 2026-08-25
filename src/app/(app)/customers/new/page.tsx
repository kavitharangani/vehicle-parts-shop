import { CustomerForm } from "../CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Add Customer</h1>
      <CustomerForm />
    </div>
  );
}
