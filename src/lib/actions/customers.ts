"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type FormState = { error?: string } | undefined;

export async function createCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await prisma.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await prisma.customer.update({ where: { id }, data: parsed.data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  await requireUser();
  try {
    await prisma.customer.delete({ where: { id } });
  } catch {
    throw new Error(
      "Cannot delete this customer — they have linked vehicles or sales records."
    );
  }
  revalidatePath("/customers");
}
