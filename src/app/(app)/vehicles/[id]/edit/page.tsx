import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VehicleForm } from "../../VehicleForm";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const [vehicle, customers] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: params.id } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!vehicle) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Edit Vehicle</h1>
      <VehicleForm vehicle={vehicle} customers={customers} />
    </div>
  );
}
