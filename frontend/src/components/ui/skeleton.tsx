import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-[var(--radius-md)] bg-[var(--accent)]/60",
      className
    )}
  />
);

