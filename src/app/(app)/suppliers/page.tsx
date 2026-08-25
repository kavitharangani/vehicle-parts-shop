import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteSupplier } from "@/lib/actions/suppliers";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { parts: true, purchases: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500">{suppliers.length} supplier(s) registered</p>
        </div>
        <LinkButton href="/suppliers/new">
          <Plus size={16} /> Add Supplier
        </LinkButton>
      </div>

      <Card>
        {suppliers.length === 0 ? (
          <EmptyState message="No suppliers yet. Add your first supplier." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium text-center">Parts Supplied</th>
                  <th className="px-5 py-3 font-medium text-center">Purchases</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3 text-slate-600">{s.phone || "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{s.address || "-"}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{s._count.parts}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{s._count.purchases}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/suppliers/${s.id}/edit`} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton action={deleteSupplier.bind(null, s.id)} confirmText={`Delete supplier "${s.name}"?`} />
                      </div>
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
