import { prisma } from "@/lib/prisma";
import { SaleForm } from "../SaleForm";

export default async function NewSalePage() {
  const [customers, vehicles, partsRaw] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { vehicleNumber: "asc" } }),
    prisma.part.findMany({
      where: { quantity: { gt: 0 } },
      orderBy: { partName: "asc" },
      select: { id: true, partCode: true, partName: true, sellingPrice: true, quantity: true },
    }),
  ]);
  const parts = partsRaw.map((p) => ({ ...p, sellingPrice: Number(p.sellingPrice) }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">New Sale</h1>
      <SaleForm customers={customers} vehicles={vehicles} parts={parts} />
    </div>
  );
}
