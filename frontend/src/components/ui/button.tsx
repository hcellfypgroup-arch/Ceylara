import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ElementRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg" | "pill";
  loading?: boolean;
  asChild?: boolean;
};

export const Button = forwardRef<ElementRef<"button">, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      loading,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 rounded-full active:scale-95 transform hover:scale-105";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--brand)] hover:text-[var(--brand-foreground)] hover:shadow-lg hover:shadow-[var(--brand)]/30 focus-visible:ring-[var(--primary)] active:bg-[var(--brand)] active:text-[var(--brand-foreground)] active:shadow-md",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--brand)] hover:text-[var(--brand-foreground)] hover:shadow-md focus-visible:ring-[var(--secondary)] active:bg-[var(--brand)] active:text-[var(--brand-foreground)] active:shadow-sm",
      ghost:
        "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] hover:shadow-sm focus-visible:ring-[var(--accent)] active:bg-[var(--accent)] active:text-[var(--foreground)]",
      outline:
        "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--brand)] hover:text-[var(--foreground)] hover:shadow-sm focus-visible:ring-[var(--border)] active:bg-[var(--accent)] active:text-[var(--foreground)]",
      subtle:
        "bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] hover:shadow-sm focus-visible:ring-[var(--accent)] active:bg-[var(--secondary)] active:text-[var(--secondary-foreground)]",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "text-sm px-4 py-2 rounded-full",
      md: "text-sm px-5 py-2.5 rounded-full",
      lg: "text-base px-6 py-3 rounded-full",
      pill: "text-base px-8 py-3 rounded-[var(--radius-pill)]",
    };

    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(!asChild && { disabled: disabled ?? loading })}
        {...props}
      >
        {loading ? "Please wait..." : children}
      </Component>
    );
  }
);

Button.displayName = "Button";

