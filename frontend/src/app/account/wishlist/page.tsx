import { WishlistList } from "@/components/account/wishlist-list";

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Wishlist
        </p>
        <h1 className="text-3xl font-semibold">Your wishlist</h1>
        <p className="text-sm text-[var(--muted)]">
          Save products to compare and checkout later.
        </p>
      </div>
      <WishlistList />
    </div>
  );
}

