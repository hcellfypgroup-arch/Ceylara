"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  User,
  Heart,
  PhoneCall,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const CartBadge = () => {
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  
  if (count === 0) return null;
  
  return (
    <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
};

type Category = {
  name: string;
  slug: string;
};

type SiteHeaderProps = {
  categories?: Category[];
};

export const SiteHeader = ({ categories = [] }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Shop All", href: "/shop" },
    ...categories.map((category) => ({
      name: category.name,
      href: `/categories/${category.slug}`,
    })),
  ];

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-lg">
      <div className="hidden border-b border-[var(--border)] bg-white/80 text-xs md:block">
        <div className="container flex items-center justify-between gap-6 py-2">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 my-2 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--foreground)]">
              <span className="size-2 rounded-full bg-[var(--brand)]" />
              Free shipping above Rs 15,000
            </span>
            <span className="inline-flex items-center gap-2 text-[var(--muted)]">
              <PhoneCall className="size-3.5" />
              Contact +94 74 319 3847
            </span>
          </div>
          <Link
            href="/faq"
            className="text-[var(--foreground)] underline-offset-4 hover:underline"
          >
            Help & FAQ
          </Link>
        </div>
      </div>
      <div className="container flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between gap-4 py-2 md:pt-2 md:pb-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden rounded-full border border-[var(--border)] p-2"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/" className="text-2xl font-semibold tracking-tight">
              CEYLARA
            </Link>
          </div>
          <form
            action="/search"
            method="get"
            className="hidden flex-1 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--muted)] md:flex"
          >
            <Search className="size-4" />
            <Input
              type="search"
              name="q"
              placeholder="Search dresses, SKU, color..."
              className="border-none bg-transparent px-0 text-sm text-[var(--foreground)] shadow-none focus-visible:ring-0"
            />
          </form>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/search">
                <Search className="size-4 md:hidden" />
                <span className="hidden md:inline">Search</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/account/wishlist">
                <Heart className="size-4" />
                <span className="hidden md:inline">Wishlist</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="relative gap-2" asChild>
              <Link href="/cart">
                <ShoppingBag className="size-5" />
                <span className="hidden md:inline">Cart</span>
                <CartBadge />
              </Link>
            </Button>
            {loading ? (
              <div className="hidden h-9 w-20 animate-pulse rounded-full bg-gray-200 lg:block" />
            ) : user ? (
              <div className="relative hidden lg:block" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-[var(--accent)]"
                >
                  <User className="size-4" />
                  <span className="max-w-[100px] truncate">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="size-3" />
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--border)] bg-white shadow-lg">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm hover:bg-[var(--accent)]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-sm hover:bg-[var(--accent)]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account/wishlist"
                      className="block px-4 py-2 text-sm hover:bg-[var(--accent)]"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <hr className="my-1 border-[var(--border)]" />
                    <button
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-full px-6 lg:inline-flex"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
        <nav className="hidden items-center justify-center gap-2 overflow-x-auto rounded-full border border-[var(--border)] bg-white/70 px-3 py-2 text-sm lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/shop"
                ? pathname === "/shop"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95",
                  "border border-[var(--border)] bg-transparent text-[var(--foreground)]",
                  "hover:bg-[var(--accent)] hover:border-[var(--brand)] hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--border)]",
                  active &&
                    "bg-[var(--accent)] border-[var(--brand)] text-[var(--foreground)] shadow-sm"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        className={cn(
          "lg:hidden border-t border-[var(--border)] bg-white/95 px-4 transition-all",
          open ? "max-h-[420px] py-4" : "max-h-0 overflow-hidden py-0"
        )}
      >
        <div className="flex flex-col gap-3">
          <form
            action="/search"
            method="get"
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2"
          >
            <Search className="size-4 text-[var(--muted)]" />
            <input
              type="search"
              name="q"
              placeholder="Search CEYLARA"
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none"
            />
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/60"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/60"
                onClick={() => setOpen(false)}
              >
                <User className="size-4" />
                My Account
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/60"
              onClick={() => setOpen(false)}
            >
              <User className="size-4" />
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

