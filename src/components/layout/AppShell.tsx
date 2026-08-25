import { Sidebar } from "./Sidebar";
import { SignOutButton } from "./SignOutButton";
import type { Session } from "next-auth";

export function AppShell({
  user,
  children,
}: {
  user: Session["user"];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isAdmin={user.role === "ADMIN"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="md:hidden text-sm font-semibold text-slate-900">AutoParts POS</div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
