import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PartForm } from "../../PartForm";

export default async function EditPartPage({ params }: { params: { id: string } }) {
  const [part, categories, vehicles, suppliers] = await Promise.all([
    prisma.part.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { categoryName: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { vehicleNumber: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!part) notFound();

  const plainPart = {
    ...part,
    buyingPrice: Number(part.buyingPrice),
    sellingPrice: Number(part.sellingPrice),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Edit Part</h1>
      <PartForm part={plainPart} categories={categories} vehicles={vehicles} suppliers={suppliers} />
    </div>
  );
}
