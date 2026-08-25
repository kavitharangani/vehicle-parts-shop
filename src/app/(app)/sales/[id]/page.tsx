import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, Badge } from "@/components/ui/Card";
import { formatMoney, formatDate, formatDateTime } from "@/lib/utils";
import { PaymentForm } from "./PaymentForm";
import { PrintButton } from "./PrintButton";

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      vehicle: true,
      user: true,
      items: { include: { part: true } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
  if (!sale) notFound();

  const balance = Number(sale.balanceAmount);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoice {sale.invoiceNo}</h1>
          <p className="text-sm text-slate-500">{formatDateTime(sale.saleDate)} · Served by {sale.user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {balance > 0 ? <Badge tone="warning">Balance {formatMoney(sale.balanceAmount.toString())}</Badge> : <Badge tone="success">Fully Paid</Badge>}
          <PrintButton />
        </div>
      </div>

      <Card className="p-6 print:border-0 print:shadow-none">
        <div className="mb-6 hidden print:block">
          <h1 className="text-lg font-semibold text-slate-900">AutoParts POS — Invoice {sale.invoiceNo}</h1>
          <p className="text-sm text-slate-500">{formatDateTime(sale.saleDate)}</p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase text-slate-400">Customer</p>
            <p className="font-medium text-slate-900">{sale.customer?.name ?? "Walk-in Customer"}</p>
            {sale.customer?.phone && <p className="text-slate-500">{sale.customer.phone}</p>}
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Vehicle</p>
            <p className="font-medium text-slate-900">
              {sale.vehicle ? `${sale.vehicle.vehicleNumber} (${sale.vehicle.brand} ${sale.vehicle.model})` : "-"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader title="Items" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Part</th>
                <th className="px-5 py-3 font-medium text-right">Qty</th>
                <th className="px-5 py-3 font-medium text-right">Unit Price</th>
                <th className="px-5 py-3 font-medium text-right">Discount</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{item.part.partName}</p>
                    <p className="text-xs text-slate-400">{item.part.partCode}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatMoney(item.unitPrice.toString())}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatMoney(item.discount.toString())}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">{formatMoney(item.total.toString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1 border-t border-slate-100 px-5 py-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatMoney(sale.subtotal.toString())}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {formatMoney(sale.discount.toString())}</span></div>
          <div className="flex justify-between text-base font-semibold"><span>Grand Total</span><span>{formatMoney(sale.grandTotal.toString())}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Paid</span><span>{formatMoney(sale.paidAmount.toString())}</span></div>
          <div className="flex justify-between font-medium text-amber-600"><span>Balance</span><span>{formatMoney(sale.balanceAmount.toString())}</span></div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        <Card>
          <CardHeader title="Payment History" />
          {sale.payments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No payments recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sale.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{formatMoney(p.amount.toString())}</p>
                    <p className="text-xs text-slate-400">{p.paymentMethod} · {formatDate(p.paymentDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {balance > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Record Payment</h2>
            <PaymentForm saleId={sale.id} balance={balance} />
          </Card>
        )}
      </div>
    </div>
  );
}
