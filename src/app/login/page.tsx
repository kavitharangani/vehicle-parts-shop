import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { Wrench } from "lucide-react";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Wrench size={22} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">AutoParts POS</h1>
          <p className="text-sm text-slate-500">Vehicle Spare Parts Shop System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
