"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "./customers";

const partSchema = z.object({
  partCode: z.string().min(1, "Part code is required"),
  partName: z.string().min(1, "Part name is required"),
  categoryId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  compatibleVehicle: z.string().optional().nullable(),
  buyingPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0),
  supplierId: z.string().optional().nullable(),
});

function fromForm(formData: FormData) {
  return {
    partCode: formData.get("partCode"),
    partName: formData.get("partName"),
    categoryId: formData.get("categoryId") || null,
    vehicleId: formData.get("vehicleId") || null,
    compatibleVehicle: formData.get("compatibleVehicle") || null,
    buyingPrice: formData.get("buyingPrice"),
    sellingPrice: formData.get("sellingPrice"),
    quantity: formData.get("quantity") || 0,
    reorderLevel: formData.get("reorderLevel") || 5,
    supplierId: formData.get("supplierId") || null,
  };
}

export async function createPart(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = partSchema.safeParse(fromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    const part = await prisma.part.create({ data: parsed.data });
    if (parsed.data.quantity > 0) {
      await prisma.stockTransaction.create({
        data: {
          partId: part.id,
          transactionType: "ADJUSTMENT",
          quantity: parsed.data.quantity,
          note: "Opening stock",
        },
      });
    }
  } catch {
    return { error: "Part code already exists." };
  }
  revalidatePath("/parts");
  redirect("/parts");
}

export async function updatePart(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = partSchema.safeParse(fromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    const existing = await prisma.part.findUnique({ where: { id } });
    await prisma.part.update({ where: { id }, data: parsed.data });

    const diff = parsed.data.quantity - (existing?.quantity ?? 0);
    if (diff !== 0) {
      await prisma.stockTransaction.create({
        data: {
          partId: id,
          transactionType: "ADJUSTMENT",
          quantity: diff,
          note: "Manual stock adjustment",
        },
      });
    }
  } catch {
    return { error: "Part code already exists." };
  }
  revalidatePath("/parts");
  redirect("/parts");
}

export async function deletePart(id: string) {
  await requireUser();
  try {
    await prisma.part.delete({ where: { id } });
  } catch {
    throw new Error("Cannot delete this part — it has linked purchase/sale records.");
  }
  revalidatePath("/parts");
}
