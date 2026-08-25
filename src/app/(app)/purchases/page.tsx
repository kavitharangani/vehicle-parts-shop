import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatMoney, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { purchaseDate: "desc" },
    include: { supplier: true, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Purchases</h1>
          <p className="text-sm text-slate-500">{purchases.length} purchase(s) recorded</p>
        </div>
        <LinkButton href="/purchases/new">
          <Plus size={16} /> New Purchase
        </LinkButton>
      </div>

      <Card>
        {purchases.length === 0 ? (
          <EmptyState message="No purchases yet. Record your first stock purchase." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Invoice No.</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-center">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/purchases/${p.id}`} className="font-medium text-slate-900 hover:underline">
                        {p.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.supplier.name}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(p.purchaseDate)}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{p._count.items}</td>
                    <td className="px-5 py-3 text-right text-slate-900">{formatMoney(p.totalAmount.toString())}</td>
                    <td className="px-5 py-3 text-right">
                      {Number(p.balanceAmount) > 0 ? (
                        <Badge tone="warning">{formatMoney(p.balanceAmount.toString())}</Badge>
                      ) : (
                        <Badge tone="success">Settled</Badge>
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
