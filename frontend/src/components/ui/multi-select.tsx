"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  singleSelect?: boolean;
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  singleSelect = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (singleSelect) {
      // For single select, replace the value
      onChange(value.includes(optionValue) ? [] : [optionValue]);
      setIsOpen(false);
    } else {
      // For multi-select, toggle the value
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value
    .map((v) => options.find((opt) => opt.value === v)?.label)
    .filter(Boolean);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          "min-h-[42px] flex items-center justify-between gap-2"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => {
              const optionValue = value[idx];
              return (
                <span
                  key={optionValue}
                  className="inline-flex items-center gap-1 rounded bg-[var(--accent)] px-2 py-0.5 text-xs"
                >
                  {label}
                  {!singleSelect && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => removeOption(optionValue, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          removeOption(optionValue, e as any);
                        }
                      }}
                      className="hover:text-red-500 cursor-pointer"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </span>
              );
            })
          ) : (
            <span className="text-[var(--muted)]">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted)] transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-[var(--muted)]">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center gap-2 text-[var(--foreground)]",
                    isSelected && "bg-[var(--accent)] text-[var(--foreground)]"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[var(--border)]"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span>{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

