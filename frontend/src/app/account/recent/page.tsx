import { RecentList } from "@/components/account/recent-list";

export default function RecentlyViewedPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Recently Viewed
        </p>
        <h1 className="text-3xl font-semibold">Your browsing history</h1>
        <p className="text-sm text-[var(--muted)]">
          Products you've recently viewed.
        </p>
      </div>
      <RecentList />
    </div>
  );
}

