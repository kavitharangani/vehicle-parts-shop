"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Truck,
  Car,
  Tags,
  Package,
  ShoppingCart,
  ReceiptText,
  Undo2,
  BarChart3,
  UserCog,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales / Invoices", icon: ReceiptText },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/returns", label: "Sale Returns", icon: Undo2 },
  { href: "/parts", label: "Parts / Stock", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
          <Wrench size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900">AutoParts POS</p>
          <p className="text-xs leading-tight text-slate-400">Spare Parts Shop</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/users")
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <UserCog size={17} />
            System Users
          </Link>
        )}
      </nav>
    </aside>
  );
}
