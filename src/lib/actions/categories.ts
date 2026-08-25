"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { FormState } from "./customers";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
});

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = categorySchema.safeParse({ categoryName: formData.get("categoryName") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "Category already exists." };
  }
  revalidatePath("/categories");
  return {};
}

export async function updateCategory(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const parsed = categorySchema.safeParse({ categoryName: formData.get("categoryName") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Category already exists." };
  }
  revalidatePath("/categories");
  return {};
}

export async function deleteCategory(id: string) {
  await requireUser();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    throw new Error("Cannot delete this category — it has linked parts.");
  }
  revalidatePath("/categories");
}
