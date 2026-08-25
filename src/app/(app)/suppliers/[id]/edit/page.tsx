import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupplierForm } from "../../SupplierForm";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Edit Supplier</h1>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
