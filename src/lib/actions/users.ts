"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "./customers";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
});

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  if (!parsed.data.password) return { error: "Password is required for a new user." };

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        role: parsed.data.role,
        password: hashed,
      },
    });
  } catch {
    return { error: "Username already exists." };
  }
  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    role: formData.get("role"),
    password: formData.get("password") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const data: {
    name: string;
    username: string;
    role: "ADMIN" | "MANAGER" | "CASHIER";
    password?: string;
  } = {
    name: parsed.data.name,
    username: parsed.data.username,
    role: parsed.data.role,
  };
  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 10);
  }

  try {
    await prisma.user.update({ where: { id }, data });
  } catch {
    return { error: "Username already exists." };
  }
  revalidatePath("/users");
  redirect("/users");
}

export async function toggleUserActive(id: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidatePath("/users");
}
