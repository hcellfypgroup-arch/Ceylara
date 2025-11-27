"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function AccountOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Account overview
        </p>
        <h1 className="text-3xl font-semibold">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Manage profile, addresses, orders, wishlist, and track deliveries.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <p className="text-sm text-[var(--muted)]">Track and manage orders.</p>
          <Button asChild className="mt-4  text-black" size="sm" variant="outline">
            <Link href="/account/orders">View orders</Link>
          </Button>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
          <h3 className="text-lg font-semibold">Wishlist</h3>
          <p className="text-sm text-[var(--muted)]">
            Save looks you plan to buy later.
          </p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/account/wishlist">View wishlist</Link>
          </Button>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="text-sm text-[var(--muted)]">
            Update your personal information.
          </p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/account/profile">Edit profile</Link>
          </Button>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-4">
          <h3 className="text-lg font-semibold">Addresses</h3>
          <p className="text-sm text-[var(--muted)]">
            Manage your shipping addresses.
          </p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/account/address">Manage addresses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

