"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <FormField label="Username" htmlFor="username" required>
          <Input id="username" name="username" autoComplete="username" required autoFocus />
        </FormField>
        <FormField label="Password" htmlFor="password" required>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </FormField>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-400">
        Default admin: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
      </p>
    </Card>
  );
}
