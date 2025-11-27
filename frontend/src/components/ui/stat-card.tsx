import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
  tone?: "default" | "brand" | "success" | "warning";
  className?: string;
};

export const StatCard = ({
  label,
  value,
  trend,
  icon,
  tone = "default",
  className,
}: StatCardProps) => {
  const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
    default: "bg-white",
    brand: "bg-[var(--brand)]/10",
    success: "bg-[var(--success)]/10",
    warning: "bg-[var(--warning)]/10",
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--border)] px-5 py-4 shadow-sm",
        tones[tone],
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
            {value}
          </p>
          {trend && (
            <p className={`mt-1 text-sm ${
              trend.includes("+") || trend.includes("No previous") || trend.includes("All good")
                ? "text-[var(--success)]"
                : trend.includes("-")
                ? "text-red-600"
                : "text-[var(--muted)]"
            }`}>{trend}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-2xl bg-white p-3 text-[var(--foreground)] shadow-inner">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

