import { prisma } from "@/lib/prisma";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteCustomer } from "@/lib/actions/customers";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { vehicles: true, sales: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">{customers.length} customer(s) registered</p>
        </div>
        <LinkButton href="/customers/new">
          <Plus size={16} /> Add Customer
        </LinkButton>
      </div>

      <Card>
        {customers.length === 0 ? (
          <EmptyState message="No customers yet. Add your first customer." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium text-center">Vehicles</th>
                  <th className="px-5 py-3 font-medium text-center">Sales</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3 text-slate-600">{c.phone || "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{c.address || "-"}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{c._count.vehicles}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{c._count.sales}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${c.id}/edit`} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton action={deleteCustomer.bind(null, c.id)} confirmText={`Delete customer "${c.name}"?`} />
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
