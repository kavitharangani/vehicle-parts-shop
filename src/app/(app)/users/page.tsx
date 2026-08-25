import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, EmptyState, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { ToggleActiveButton } from "./ToggleActiveButton";

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">System Users</h1>
          <p className="text-sm text-slate-500">{users.length} user(s) with system access</p>
        </div>
        <LinkButton href="/users/new">
          <Plus size={16} /> Add User
        </LinkButton>
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState message="No users yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-5 py-3 text-slate-600">{u.username}</td>
                    <td className="px-5 py-3"><Badge>{u.role}</Badge></td>
                    <td className="px-5 py-3">
                      {u.active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Disabled</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/users/${u.id}/edit`} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                          <Pencil size={16} />
                        </Link>
                        <ToggleActiveButton userId={u.id} active={u.active} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
