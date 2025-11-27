"use client";

import { Select } from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";
import { useProductFilters } from "@/hooks/use-product-filters";

export const SortBar = () => {
  const { activeFilters, updateFilters } = useProductFilters();
  const sort = (activeFilters.sort as string) ?? "latest";

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 rounded-[var(--radius-lg)] sm:rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-3 sm:px-4 py-2.5 sm:py-3">
      <p className="text-xs sm:text-sm text-[var(--muted)]">
        {Array.isArray(activeFilters.category) && activeFilters.category.length > 0
          ? `Showing ${activeFilters.category.length} categor${activeFilters.category.length === 1 ? 'y' : 'ies'}`
          : "Showing all products"}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-[var(--muted)] whitespace-nowrap">Sort by</span>
        <Select
          value={sort}
          onChange={(event) => updateFilters({ sort: event.target.value })}
          className="text-xs sm:text-sm w-auto min-w-[160px]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

