import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatMoney, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: { customer: true, user: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales / Invoices</h1>
          <p className="text-sm text-slate-500">{sales.length} invoice(s) recorded</p>
        </div>
        <LinkButton href="/sales/new">
          <Plus size={16} /> New Sale
        </LinkButton>
      </div>

      <Card>
        {sales.length === 0 ? (
          <EmptyState message="No sales yet. Create your first invoice." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Invoice No.</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Cashier</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/sales/${s.id}`} className="font-medium text-slate-900 hover:underline">
                        {s.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.customer?.name ?? "Walk-in"}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(s.saleDate)}</td>
                    <td className="px-5 py-3 text-slate-600">{s.user.name}</td>
                    <td className="px-5 py-3 text-right text-slate-900">{formatMoney(s.grandTotal.toString())}</td>
                    <td className="px-5 py-3 text-right">
                      {Number(s.balanceAmount) > 0 ? (
                        <Badge tone="warning">{formatMoney(s.balanceAmount.toString())}</Badge>
                      ) : (
                        <Badge tone="success">Paid</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
