"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "./customers";

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().optional().nullable(),
  customerId: z.string().optional().nullable(),
});

function clean(data: z.infer<typeof vehicleSchema>) {
  return {
    ...data,
    customerId: data.customerId || null,
    year: data.year || null,
  };
}

export async function createVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = vehicleSchema.safeParse({
    vehicleNumber: formData.get("vehicleNumber"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    customerId: formData.get("customerId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    await prisma.vehicle.create({ data: clean(parsed.data) });
  } catch {
    return { error: "Vehicle number already exists." };
  }
  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function updateVehicle(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = vehicleSchema.safeParse({
    vehicleNumber: formData.get("vehicleNumber"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year") || undefined,
    customerId: formData.get("customerId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    await prisma.vehicle.update({ where: { id }, data: clean(parsed.data) });
  } catch {
    return { error: "Vehicle number already exists." };
  }
  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function deleteVehicle(id: string) {
  await requireUser();
  try {
    await prisma.vehicle.delete({ where: { id } });
  } catch {
    throw new Error("Cannot delete this vehicle — it has linked parts or sales records.");
  }
  revalidatePath("/vehicles");
}
