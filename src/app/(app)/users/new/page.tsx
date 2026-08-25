import { requireAdmin } from "@/lib/session";
import { UserForm } from "../UserForm";

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Add User</h1>
      <UserForm />
    </div>
  );
}
