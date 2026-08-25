"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "./customers";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export async function createSupplier(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await prisma.supplier.create({ data: parsed.data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await prisma.supplier.update({ where: { id }, data: parsed.data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(id: string) {
  await requireUser();
  try {
    await prisma.supplier.delete({ where: { id } });
  } catch {
    throw new Error(
      "Cannot delete this supplier — they have linked parts or purchase records."
    );
  }
  revalidatePath("/suppliers");
}
