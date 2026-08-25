import { prisma } from "@/lib/prisma";
import { VehicleForm } from "../VehicleForm";

export default async function NewVehiclePage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Add Vehicle</h1>
      <VehicleForm customers={customers} />
    </div>
  );
}
