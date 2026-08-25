import { prisma } from "@/lib/prisma";
import { PartForm } from "../PartForm";

export default async function NewPartPage() {
  const [categories, vehicles, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { categoryName: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { vehicleNumber: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Add Part</h1>
      <PartForm categories={categories} vehicles={vehicles} suppliers={suppliers} />
    </div>
  );
}
