"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const accountNav = [
  { label: "Profile", href: "/account/profile" },
  { label: "Address book", href: "/account/address" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Recently viewed", href: "/account/recent" },
];

export const AccountShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <section className="section">
      <div className="container">
        <div className="grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
          <nav className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              My Account
            </p>
            <div className="mt-4 space-y-1">
              {accountNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[var(--radius-md)] px-4 py-2 font-medium",
                    pathname === item.href
                      ? "bg-[var(--accent)] text-black"
                      : "text-[var(--muted)] hover:bg-[var(--accent)]/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
};

