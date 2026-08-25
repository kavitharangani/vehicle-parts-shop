import { prisma } from "@/lib/prisma";
import { PurchaseForm } from "../PurchaseForm";

export default async function NewPurchasePage() {
  const [suppliers, partsRaw] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.part.findMany({
      orderBy: { partName: "asc" },
      select: { id: true, partCode: true, partName: true, buyingPrice: true, quantity: true },
    }),
  ]);
  const parts = partsRaw.map((p) => ({ ...p, buyingPrice: Number(p.buyingPrice) }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">New Purchase</h1>
      <PurchaseForm suppliers={suppliers} parts={parts} />
    </div>
  );
}
