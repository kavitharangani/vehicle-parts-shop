import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteVehicle } from "@/lib/actions/vehicles";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Vehicles</h1>
          <p className="text-sm text-slate-500">{vehicles.length} vehicle(s) registered</p>
        </div>
        <LinkButton href="/vehicles/new">
          <Plus size={16} /> Add Vehicle
        </LinkButton>
      </div>

      <Card>
        {vehicles.length === 0 ? (
          <EmptyState message="No vehicles yet. Add your first vehicle." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Vehicle No.</th>
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Year</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{v.vehicleNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{v.brand}</td>
                    <td className="px-5 py-3 text-slate-600">{v.model}</td>
                    <td className="px-5 py-3 text-slate-600">{v.year || "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{v.customer?.name || "-"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/vehicles/${v.id}/edit`} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton action={deleteVehicle.bind(null, v.id)} confirmText={`Delete vehicle "${v.vehicleNumber}"?`} />
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
