"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  ListOrdered,
  Users,
  Percent,
  Truck,
  BarChart,
  Ruler,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: ListOrdered },
  { label: "Orders", href: "/admin/orders", icon: BarChart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Percent },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Size Chart", href: "/admin/size-chart", icon: Ruler },
];

interface AdminShellProps {
  children: React.ReactNode;
  user?: { id: string; role: string; email: string };
}

export const AdminShell = ({ children, user }: AdminShellProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r border-[var(--border)] bg-white px-6 py-8">
        <p className="text-xl font-semibold text-[var(--foreground)]">
          CEYLARA Admin
        </p>
        <nav className="mt-8 space-y-1 text-sm">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 font-medium transition",
                  isActive
                    ? "bg-[var(--accent)] text-black"
                    : "text-[var(--muted)] hover:bg-[var(--accent)]/50"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-8">
          <div className="mb-2 text-xs text-[var(--muted)]">
            {user?.email || "Admin"}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>
      <div className="bg-[var(--background)]">
        <main className="p-10">{children}</main>
      </div>
    </div>
  );
};

