import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, Badge } from "@/components/ui/Card";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function PurchaseDetailPage({ params }: { params: { id: string } }) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    include: { supplier: true, items: { include: { part: true } } },
  });
  if (!purchase) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Purchase {purchase.invoiceNo}</h1>
          <p className="text-sm text-slate-500">{formatDate(purchase.purchaseDate)} · {purchase.supplier.name}</p>
        </div>
        {Number(purchase.balanceAmount) > 0 ? (
          <Badge tone="warning">Balance {formatMoney(purchase.balanceAmount.toString())}</Badge>
        ) : (
          <Badge tone="success">Fully Settled</Badge>
        )}
      </div>

      <Card>
        <CardHeader title="Items" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Part</th>
                <th className="px-5 py-3 font-medium text-right">Quantity</th>
                <th className="px-5 py-3 font-medium text-right">Unit Price</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{item.part.partName}</p>
                    <p className="text-xs text-slate-400">{item.part.partCode}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatMoney(item.unitPrice.toString())}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">{formatMoney(item.total.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1 border-t border-slate-100 px-5 py-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Total Amount</span><span className="font-medium text-slate-900">{formatMoney(purchase.totalAmount.toString())}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Paid Amount</span><span className="text-slate-900">{formatMoney(purchase.paidAmount.toString())}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Balance</span><span className="font-medium text-slate-900">{formatMoney(purchase.balanceAmount.toString())}</span></div>
        </div>
      </Card>
    </div>
  );
}
