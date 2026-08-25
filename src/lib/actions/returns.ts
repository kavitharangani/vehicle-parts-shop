"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "./customers";

const itemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  amount: z.coerce.number().min(0),
});

const returnSchema = z.object({
  saleId: z.string().min(1, "Sale/invoice is required"),
  reason: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Add at least one part to return"),
});

export async function createSaleReturn(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse((formData.get("itemsJson") as string) || "[]");
  } catch {
    return { error: "Invalid items data." };
  }

  const parsed = returnSchema.safeParse({
    saleId: formData.get("saleId"),
    reason: formData.get("reason"),
    items: itemsRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const { saleId, reason, items } = parsed.data;

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: true },
  });
  if (!sale) return { error: "Invoice not found." };

  for (const item of items) {
    const soldItem = sale.items.find((si) => si.partId === item.partId);
    if (!soldItem) return { error: "Selected part was not part of this invoice." };
    if (item.quantity > soldItem.quantity) {
      return { error: `Return quantity exceeds quantity sold for this part.` };
    }
  }

  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

  const saleReturn = await prisma.$transaction(async (tx) => {
    const created = await tx.saleReturn.create({
      data: {
        saleId,
        totalAmount,
        reason: reason || null,
        items: {
          create: items.map((i) => ({
            partId: i.partId,
            quantity: i.quantity,
            amount: i.amount,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.part.update({
        where: { id: item.partId },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.stockTransaction.create({
        data: {
          partId: item.partId,
          transactionType: "RETURN",
          quantity: item.quantity,
          referenceId: created.id,
          note: `Return against ${sale.invoiceNo}`,
        },
      });
    }

    return created;
  });

  revalidatePath("/returns");
  revalidatePath("/parts");
  redirect(`/returns/${saleReturn.id}`);
}
