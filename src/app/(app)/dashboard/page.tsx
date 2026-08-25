import { prisma } from "@/lib/prisma";
import { StatCard, Card, CardHeader, EmptyState, Badge } from "@/components/ui/Card";
import { formatMoney, formatDate, toNumber } from "@/lib/utils";
import Link from "next/link";
import { SalesTrendChart } from "./SalesTrendChart";

export default async function DashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [
    partsCount,
    allParts,
    todaySales,
    monthSales,
    recentSales,
    outstandingBalances,
    trendSales,
    customersCount,
  ] = await Promise.all([
    prisma.part.count(),
    prisma.part.findMany({
      select: { id: true, partName: true, partCode: true, quantity: true, reorderLevel: true },
      orderBy: { quantity: "asc" },
    }),
    prisma.sale.aggregate({
      where: { saleDate: { gte: startOfToday } },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: { saleDate: { gte: startOfMonth } },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.sale.findMany({
      orderBy: { saleDate: "desc" },
      take: 6,
      include: { customer: true },
    }),
    prisma.sale.aggregate({
      where: { balanceAmount: { gt: 0 } },
      _sum: { balanceAmount: true },
    }),
    prisma.sale.findMany({
      where: { saleDate: { gte: thirtyDaysAgo } },
      select: { saleDate: true, grandTotal: true },
    }),
    prisma.customer.count(),
  ]);

  const lowStockParts = allParts.filter((p) => p.quantity <= p.reorderLevel).slice(0, 8);

  const trendMap = new Map<string, number>();
  for (const s of trendSales) {
    const key = s.saleDate.toISOString().slice(0, 10);
    trendMap.set(key, (trendMap.get(key) ?? 0) + toNumber(s.grandTotal));
  }
  const chartData = Array.from(trendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date: date.slice(5), total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your shop&apos;s activity</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Sales" value={formatMoney(toNumber(todaySales._sum.grandTotal))} hint={`${todaySales._count} invoice(s)`} />
        <StatCard label="This Month's Sales" value={formatMoney(toNumber(monthSales._sum.grandTotal))} hint={`${monthSales._count} invoice(s)`} tone="success" />
        <StatCard label="Outstanding Balance" value={formatMoney(toNumber(outstandingBalances._sum.balanceAmount))} hint="Total owed by customers" tone="warning" />
        <StatCard label="Low Stock Parts" value={String(lowStockParts.length)} hint={`of ${partsCount} total parts`} tone={lowStockParts.length > 0 ? "danger" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Sales Trend (last 30 days)" />
          <div className="p-5">
            <SalesTrendChart data={chartData} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Low Stock Alerts" action={<Link href="/parts" className="text-xs font-medium text-slate-500 hover:text-slate-900">View all</Link>} />
          {lowStockParts.length === 0 ? (
            <EmptyState message="All parts are well stocked." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStockParts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.partName}</p>
                    <p className="text-xs text-slate-400">{p.partCode}</p>
                  </div>
                  <Badge tone={p.quantity === 0 ? "danger" : "warning"}>
                    {p.quantity} left
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Sales" action={<Link href="/sales" className="text-xs font-medium text-slate-500 hover:text-slate-900">View all</Link>} />
        {recentSales.length === 0 ? (
          <EmptyState message="No sales recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-2 font-medium">Invoice</th>
                  <th className="px-5 py-2 font-medium">Customer</th>
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium text-right">Total</th>
                  <th className="px-5 py-2 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-2.5">
                      <Link href={`/sales/${s.id}`} className="font-medium text-slate-900 hover:underline">
                        {s.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-slate-600">{s.customer?.name ?? "Walk-in"}</td>
                    <td className="px-5 py-2.5 text-slate-600">{formatDate(s.saleDate)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-900">{formatMoney(toNumber(s.grandTotal))}</td>
                    <td className="px-5 py-2.5 text-right">
                      {toNumber(s.balanceAmount) > 0 ? (
                        <Badge tone="warning">{formatMoney(toNumber(s.balanceAmount))}</Badge>
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
      <p className="text-xs text-slate-400">{customersCount} customer(s) registered in total.</p>
    </div>
  );
}
