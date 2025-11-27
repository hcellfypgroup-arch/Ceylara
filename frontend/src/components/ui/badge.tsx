import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "success" | "warning";
};

export const Badge = ({ className, tone = "neutral", ...props }: BadgeProps) => {
  const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
    neutral: "bg-[var(--accent)] text-[var(--foreground)]",
    brand: "bg-[var(--brand)] text-[var(--brand-foreground)]",
    success: "bg-[var(--success)] text-white",
    warning: "bg-[var(--warning)] text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className
      )}
      {...props}
    />
  );
};

