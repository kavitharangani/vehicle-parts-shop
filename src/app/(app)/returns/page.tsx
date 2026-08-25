import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatMoney, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ReturnsPage() {
  const returns = await prisma.saleReturn.findMany({
    orderBy: { returnDate: "desc" },
    include: { sale: true, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sale Returns</h1>
          <p className="text-sm text-slate-500">{returns.length} return(s) recorded</p>
        </div>
        <LinkButton href="/returns/new">
          <Plus size={16} /> New Return
        </LinkButton>
      </div>

      <Card>
        {returns.length === 0 ? (
          <EmptyState message="No returns recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Original Invoice</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium text-center">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/returns/${r.id}`} className="font-medium text-slate-900 hover:underline">
                        {r.sale.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(r.returnDate)}</td>
                    <td className="px-5 py-3 text-slate-600">{r.reason || "-"}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{r._count.items}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{formatMoney(r.totalAmount.toString())}</td>
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
