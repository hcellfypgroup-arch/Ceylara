"use client";

import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
};

interface SelectProps {
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  children?: ReactNode;
  className?: string;
}

export const Select = ({
  value,
  onChange,
  children,
  className,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse options from children
  const options: SelectOption[] = [];
  if (children) {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === "option") {
        options.push({
          value: child.props.value || "",
          label: child.props.children || child.props.value || "",
        });
      }
    });
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || options[0]?.label || "";

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          "min-h-[42px] flex items-center justify-between gap-2 whitespace-nowrap"
        )}
      >
        <span className="text-left flex-1">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted)] transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 rounded-[var(--radius-md)] bg-[var(--primary)] shadow-lg max-h-60 overflow-auto border border-[var(--primary)] min-w-full">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-[var(--primary-foreground)]">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-[var(--primary-foreground)] hover:bg-black/20 transition-colors",
                    isSelected && "bg-black/10"
                  )}
                >
                  {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                  <span className={cn(!isSelected && "ml-6")}>{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

