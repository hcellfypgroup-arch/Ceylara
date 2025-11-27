import { AddressesList } from "@/components/account/addresses-list";

export default function AddressPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Address Book
        </p>
        <h1 className="text-3xl font-semibold">Manage delivery addresses</h1>
        <p className="text-sm text-[var(--muted)]">
          Add multiple addresses for shipping and billing.
        </p>
      </div>
      <AddressesList />
    </div>
  );
}

