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
  discount: z.coerce.number().min(0).default(0),
});

const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  discount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().default("CASH"),
  items: z.array(itemSchema).min(1, "Add at least one part"),
});

export async function createSale(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse((formData.get("itemsJson") as string) || "[]");
  } catch {
    return { error: "Invalid items data." };
  }

  const parsed = saleSchema.safeParse({
    customerId: formData.get("customerId") || null,
    vehicleId: formData.get("vehicleId") || null,
    discount: formData.get("discount") || 0,
    paidAmount: formData.get("paidAmount") || 0,
    paymentMethod: formData.get("paymentMethod") || "CASH",
    items: itemsRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const { customerId, vehicleId, discount, paidAmount, paymentMethod, items } = parsed.data;

  // Verify stock availability before committing
  const partIds = items.map((i) => i.partId);
  const parts = await prisma.part.findMany({ where: { id: { in: partIds } } });
  for (const item of items) {
    const part = parts.find((p) => p.id === item.partId);
    if (!part) return { error: "One of the selected parts no longer exists." };
    if (part.quantity < item.quantity) {
      return { error: `Not enough stock for ${part.partName}. Available: ${part.quantity}` };
    }
  }

  const itemTotals = items.map((i) => i.quantity * i.unitPrice - i.discount);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const grandTotal = Math.max(subtotal - discount, 0);
  const balanceAmount = Math.max(grandTotal - paidAmount, 0);
  const invoiceNo = generateRefNo("INV");

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        invoiceNo,
        customerId: customerId || null,
        vehicleId: vehicleId || null,
        subtotal,
        discount,
        grandTotal,
        paidAmount,
        balanceAmount,
        paymentMethod,
        userId: user.id,
        items: {
          create: items.map((i, idx) => ({
            partId: i.partId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            total: itemTotals[idx],
          })),
        },
      },
    });

    for (const item of items) {
      await tx.part.update({
        where: { id: item.partId },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.stockTransaction.create({
        data: {
          partId: item.partId,
          transactionType: "SALE",
          quantity: -item.quantity,
          referenceId: created.id,
          note: `Sale ${invoiceNo}`,
        },
      });
    }

    if (paidAmount > 0) {
      await tx.payment.create({
        data: {
          saleId: created.id,
          amount: paidAmount,
          paymentMethod,
        },
      });
    }

    return created;
  });

  revalidatePath("/sales");
  revalidatePath("/parts");
  revalidatePath("/dashboard");
  redirect(`/sales/${sale.id}`);
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.string().min(1),
});

export async function addPayment(
  saleId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return { error: "Sale not found." };

  const currentBalance = Number(sale.balanceAmount);
  if (parsed.data.amount > currentBalance) {
    return { error: `Amount exceeds outstanding balance of ${currentBalance.toFixed(2)}` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        saleId,
        amount: parsed.data.amount,
        paymentMethod: parsed.data.paymentMethod,
      },
    });
    await tx.sale.update({
      where: { id: saleId },
      data: {
        paidAmount: { increment: parsed.data.amount },
        balanceAmount: { decrement: parsed.data.amount },
      },
    });
  });

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/sales");
  return {};
}
