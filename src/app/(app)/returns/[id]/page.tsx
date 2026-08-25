import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function ReturnDetailPage({ params }: { params: { id: string } }) {
  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id: params.id },
    include: { sale: { include: { customer: true } }, items: { include: { part: true } } },
  });
  if (!saleReturn) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Return for Invoice {saleReturn.sale.invoiceNo}</h1>
        <p className="text-sm text-slate-500">{formatDate(saleReturn.returnDate)} · {saleReturn.sale.customer?.name ?? "Walk-in Customer"}</p>
      </div>

      <Card>
        <CardHeader title="Returned Items" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Part</th>
                <th className="px-5 py-3 font-medium text-right">Quantity</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {saleReturn.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{item.part.partName}</p>
                    <p className="text-xs text-slate-400">{item.part.partCode}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">{formatMoney(item.amount.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-slate-100 px-5 py-4 text-sm font-semibold">
          <span>Total Refund</span>
          <span>{formatMoney(saleReturn.totalAmount.toString())}</span>
        </div>
      </Card>

      {saleReturn.reason && (
        <Card className="p-5">
          <p className="text-xs uppercase text-slate-400">Reason</p>
          <p className="mt-1 text-sm text-slate-700">{saleReturn.reason}</p>
        </Card>
      )}
    </div>
  );
}
