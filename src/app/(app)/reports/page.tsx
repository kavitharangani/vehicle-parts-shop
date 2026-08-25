import { prisma } from "@/lib/prisma";
import { Card, CardHeader, StatCard, EmptyState, Badge } from "@/components/ui/Card";
import { formatMoney, formatDate, toNumber } from "@/lib/utils";
import { ReportFilter } from "./ReportFilter";

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = parseDate(searchParams.from, defaultFrom);
  const to = parseDate(searchParams.to, now);
  const toInclusive = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);

  const [sales, purchases, allParts, returns] = await Promise.all([
    prisma.sale.findMany({
      where: { saleDate: { gte: from, lte: toInclusive } },
      include: { items: { include: { part: true } } },
    }),
    prisma.purchase.aggregate({
      where: { purchaseDate: { gte: from, lte: toInclusive } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.part.findMany({
      select: { id: true, partName: true, partCode: true, quantity: true, reorderLevel: true, sellingPrice: true, buyingPrice: true },
    }),
    prisma.saleReturn.aggregate({
      where: { returnDate: { gte: from, lte: toInclusive } },
      _sum: { totalAmount: true },
      _count: true,
    }),
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + toNumber(s.grandTotal), 0);
  const totalCost = sales.reduce(
    (sum, s) => sum + s.items.reduce((isum, i) => isum + toNumber(i.part.buyingPrice) * i.quantity, 0),
    0
  );
  const grossProfit = totalRevenue - totalCost;

  const lowStock = allParts.filter((p) => p.quantity <= p.reorderLevel);
  const stockValue = allParts.reduce((sum, p) => sum + p.quantity * toNumber(p.buyingPrice), 0);

  // Top selling parts in range
  const salesByPart = new Map<string, { name: string; code: string; qty: number; revenue: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.partId;
      const existing = salesByPart.get(key) ?? { name: item.part.partName, code: item.part.partCode, qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += toNumber(item.total);
      salesByPart.set(key, existing);
    }
  }
  const topParts = Array.from(salesByPart.values()).sort((a, b) => b.qty - a.qty).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            {formatDate(from)} — {formatDate(to)}
          </p>
        </div>
        <ReportFilter from={from.toISOString().slice(0, 10)} to={to.toISOString().slice(0, 10)} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sales Revenue" value={formatMoney(totalRevenue)} hint={`${sales.length} invoice(s)`} />
        <StatCard label="Gross Profit" value={formatMoney(grossProfit)} tone="success" hint="Revenue - cost of goods sold" />
        <StatCard label="Purchases" value={formatMoney(toNumber(purchases._sum.totalAmount))} hint={`${purchases._count} purchase(s)`} />
        <StatCard label="Returns" value={formatMoney(toNumber(returns._sum.totalAmount))} hint={`${returns._count} return(s)`} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top Selling Parts (in period)" />
          {topParts.length === 0 ? (
            <EmptyState message="No sales in this period." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {topParts.map((p) => (
                <li key={p.code} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{formatMoney(p.revenue)}</p>
                    <p className="text-xs text-slate-400">{p.qty} sold</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Low Stock / Reorder List" />
          {lowStock.length === 0 ? (
            <EmptyState message="All parts are above reorder level." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{p.partName}</p>
                    <p className="text-xs text-slate-400">{p.partCode} · reorder at {p.reorderLevel}</p>
                  </div>
                  <Badge tone={p.quantity === 0 ? "danger" : "warning"}>{p.quantity} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-xs uppercase text-slate-400">Current Stock Value (at cost)</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(stockValue)}</p>
      </Card>
    </div>
  );
}
