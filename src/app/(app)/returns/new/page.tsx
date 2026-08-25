import { prisma } from "@/lib/prisma";
import { ReturnForm } from "../ReturnForm";

export default async function NewReturnPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    take: 200,
    include: { customer: true, items: { include: { part: true } } },
  });

  const saleOptions = sales.map((s) => ({
    id: s.id,
    invoiceNo: s.invoiceNo,
    customerName: s.customer?.name ?? "Walk-in Customer",
    items: s.items.map((i) => ({
      partId: i.partId,
      partName: i.part.partName,
      partCode: i.part.partCode,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">New Sale Return</h1>
      <ReturnForm sales={saleOptions} />
    </div>
  );
}
