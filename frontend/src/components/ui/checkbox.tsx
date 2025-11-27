import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Checkbox = ({
  className,
  label,
  checked,
  onChange,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <label className="flex items-center gap-3 text-sm text-[var(--foreground)] cursor-pointer">
    <input
      type="checkbox"
      checked={checked ?? false}
      onChange={onChange}
      className={cn(
        "size-4 cursor-pointer rounded border border-[var(--border)] text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        checked && "bg-[var(--primary)] border-[var(--primary)]",
        className
      )}
      {...props}
    />
    {label && <span className="leading-tight text-[var(--foreground)]">{label}</span>}
  </label>
);

