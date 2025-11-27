import { OrdersList } from "@/components/account/orders-list";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Orders
        </p>
        <h1 className="text-3xl font-semibold">Your orders</h1>
        <p className="text-sm text-[var(--muted)]">
          Track and manage your orders.
        </p>
      </div>
      <OrdersList />
    </div>
  );
}

