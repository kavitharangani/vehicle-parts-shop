"use client";

import { useFormState } from "react-dom";
import { createUser, updateUser } from "@/lib/actions/users";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input, Select } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
export type SafeUser = { id: string; name: string; username: string; role: string };

export function UserForm({ user }: { user?: SafeUser }) {
  const action = user ? updateUser.bind(null, user.id) : createUser;
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <Card className="max-w-xl p-6">
      <form action={formAction} className="space-y-4">
        <FormError message={state?.error} />
        <FormField label="Full Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={user?.name} required />
        </FormField>
        <FormField label="Username" htmlFor="username" required>
          <Input id="username" name="username" defaultValue={user?.username} required />
        </FormField>
        <FormField label="Role" htmlFor="role" required>
          <Select id="role" name="role" defaultValue={user?.role ?? "CASHIER"} required>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="CASHIER">Cashier</option>
          </Select>
        </FormField>
        <FormField label={user ? "New Password (leave blank to keep unchanged)" : "Password"} htmlFor="password" required={!user}>
          <Input id="password" name="password" type="password" required={!user} />
        </FormField>
        <div className="flex gap-2 pt-2">
          <SubmitButton>{user ? "Save Changes" : "Add User"}</SubmitButton>
          <LinkButton href="/users" variant="secondary">Cancel</LinkButton>
        </div>
      </form>
    </Card>
  );
}
