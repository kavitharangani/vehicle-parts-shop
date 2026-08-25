import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deletePart } from "@/lib/actions/parts";
import { formatMoney } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default async function PartsPage() {
  const parts = await prisma.part.findMany({
    orderBy: { partName: "asc" },
    include: { category: true, supplier: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Parts / Stock</h1>
          <p className="text-sm text-slate-500">{parts.length} part(s) in inventory</p>
        </div>
        <LinkButton href="/parts/new">
          <Plus size={16} /> Add Part
        </LinkButton>
      </div>

      <Card>
        {parts.length === 0 ? (
          <EmptyState message="No parts yet. Add your first part." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium text-right">Buying</th>
                  <th className="px-5 py-3 font-medium text-right">Selling</th>
                  <th className="px-5 py-3 font-medium text-center">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => {
                  const low = p.quantity <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.partCode}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{p.partName}</td>
                      <td className="px-5 py-3 text-slate-600">{p.category?.categoryName || "-"}</td>
                      <td className="px-5 py-3 text-slate-600">{p.supplier?.name || "-"}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{formatMoney(p.buyingPrice.toString())}</td>
                      <td className="px-5 py-3 text-right text-slate-900">{formatMoney(p.sellingPrice.toString())}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge tone={p.quantity === 0 ? "danger" : low ? "warning" : "success"}>
                          {p.quantity}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/parts/${p.id}/edit`} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                            <Pencil size={16} />
                          </Link>
                          <DeleteButton action={deletePart.bind(null, p.id)} confirmText={`Delete part "${p.partName}"?`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
