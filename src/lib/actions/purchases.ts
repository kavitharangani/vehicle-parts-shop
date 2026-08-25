"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateRefNo } from "@/lib/utils";
import type { FormState } from "./customers";

const itemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0),
});

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceNo: z.string().optional(),
  paidAmount: z.coerce.number().min(0).default(0),
  items: z.array(itemSchema).min(1, "Add at least one part"),
});

export async function createPurchase(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse((formData.get("itemsJson") as string) || "[]");
  } catch {
    return { error: "Invalid items data." };
  }

  const parsed = purchaseSchema.safeParse({
    supplierId: formData.get("supplierId"),
    invoiceNo: formData.get("invoiceNo"),
    paidAmount: formData.get("paidAmount") || 0,
    items: itemsRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const { supplierId, items, paidAmount } = parsed.data;
  const invoiceNo = parsed.data.invoiceNo?.trim() || generateRefNo("PUR");
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);

  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        supplierId,
        invoiceNo,
        totalAmount,
        paidAmount,
        balanceAmount,
        items: {
          create: items.map((i) => ({
            partId: i.partId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.part.update({
        where: { id: item.partId },
        data: { quantity: { increment: item.quantity }, buyingPrice: item.unitPrice },
      });
      await tx.stockTransaction.create({
        data: {
          partId: item.partId,
          transactionType: "PURCHASE",
          quantity: item.quantity,
          referenceId: created.id,
          note: `Purchase ${invoiceNo}`,
        },
      });
    }

    return created;
  });

  revalidatePath("/purchases");
  revalidatePath("/parts");
  redirect(`/purchases/${purchase.id}`);
}
