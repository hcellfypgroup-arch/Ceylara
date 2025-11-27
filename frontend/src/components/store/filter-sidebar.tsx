"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductFilters } from "@/hooks/use-product-filters";
import { SIZE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories?: Array<{ _id: string; name: string; slug: string }>;
  types?: Array<{ _id: string; name: string; slug: string }>;
}

export const FilterSidebar = ({ categories = [], types = [] }: FilterSidebarProps) => {
  const { activeFilters, updateFilters } = useProductFilters();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleFilter = (key: string, value: string) => {
    const current = Array.isArray(activeFilters[key])
      ? (activeFilters[key] as string[])
      : activeFilters[key]
        ? [activeFilters[key] as string]
        : [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    updateFilters({ [key]: next.length > 0 ? next : undefined });
  };

  const isChecked = (key: string, value: string) => {
    const filterValue = activeFilters[key];
    if (Array.isArray(filterValue)) {
      return filterValue.includes(value);
    }
    return filterValue === value;
  };

  const handlePriceFilter = (type: "min" | "max", value: string) => {
    const numValue = value ? Number(value) : undefined;
    updateFilters({
      [`price${type === "min" ? "Min" : "Max"}`]: numValue !== undefined ? String(numValue) : undefined,
    });
  };

  const filterContent = (
    <div className="space-y-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Categories
            </p>
            <div className="space-y-2">
              {categories.map((category) => (
                <Checkbox
                  key={category._id}
                  checked={isChecked("category", category._id)}
                  label={category.name}
                  onChange={() => toggleFilter("category", category._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Types */}
        {types.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Types
            </p>
            <div className="space-y-2">
              {types.map((type) => (
                <Checkbox
                  key={type._id}
                  checked={isChecked("type", type._id)}
                  label={type.name}
                  onChange={() => toggleFilter("type", type._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Sizes
          </p>
          <div className="space-y-2">
            {SIZE_OPTIONS.map((size) => (
              <Checkbox
                key={size}
                checked={isChecked("size", size)}
                label={size}
                onChange={() => toggleFilter("size", size)}
              />
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Price Range
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Min</label>
              <Input
                type="number"
                placeholder="0"
                value={activeFilters.priceMin || ""}
                onChange={(e) => handlePriceFilter("min", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Max</label>
              <Input
                type="number"
                placeholder="1000"
                value={activeFilters.priceMax || ""}
                onChange={(e) => handlePriceFilter("max", e.target.value)}
              />
            </div>
          </div>
        </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => updateFilters({})}
      >
        Reset filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        className="mb-4 flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filters
        </span>
        {(activeFilters.category || activeFilters.type || activeFilters.size || activeFilters.priceMin || activeFilters.priceMax) && (
          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs text-white">
            {[
              Array.isArray(activeFilters.category) ? activeFilters.category.length : activeFilters.category ? 1 : 0,
              Array.isArray(activeFilters.type) ? activeFilters.type.length : activeFilters.type ? 1 : 0,
              Array.isArray(activeFilters.size) ? activeFilters.size.length : activeFilters.size ? 1 : 0,
              activeFilters.priceMin || activeFilters.priceMax ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-4 md:block md:p-6 shadow-[var(--shadow-soft)]">
        {filterContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-xl)] border-t border-[var(--border)] bg-white shadow-2xl transition-transform duration-300 md:hidden",
              isMobileOpen ? "translate-y-0" : "translate-y-full"
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-4 py-3">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--accent)]"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4">{filterContent}</div>
          </aside>
        </>
      )}
    </>
  );
};

