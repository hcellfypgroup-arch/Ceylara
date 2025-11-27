import { StatCard } from "@/components/ui/stat-card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Monthly sales" value="$74,320" trend="+12% vs last month" />
        <StatCard label="Orders" value="1,230" trend="+8% vs last month" />
        <StatCard label="Coupon usage" value="320" trend="+5% vs last month" />
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-semibold">Sales overview</h2>
        <p className="text-sm text-[var(--muted)]">
          Download CSV reports covering daily, weekly, monthly sales, inventory positions,
          and top-selling categories.
        </p>
      </div>
    </div>
  );
}

