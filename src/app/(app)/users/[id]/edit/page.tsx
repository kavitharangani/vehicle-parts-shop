import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { UserForm } from "../../UserForm";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, username: true, role: true },
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Edit User</h1>
      <UserForm user={user} />
    </div>
  );
}
