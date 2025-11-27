"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type FilterPayload = Record<string, string | string[] | undefined>;

export const useProductFilters = () => {
  const router = useRouter();
  const params = useSearchParams();

  const activeFilters = useMemo(() => {
    const entries: [string, string | string[]][] = [];
    params.forEach((value, key) => {
      if (value && typeof value === 'string' && value.includes(",")) {
        entries.push([key, value.split(",")]);
      } else if (value) {
        entries.push([key, value]);
      }
    });
    return Object.fromEntries(entries);
  }, [params]);

  const updateFilters = (payload: FilterPayload) => {
    const newParams = new URLSearchParams(params.toString());
    
    // Update only the provided filters, keeping existing ones
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        // For arrays, join with comma
        newParams.set(key, value.join(","));
      } else {
        newParams.set(key, String(value));
      }
    });
    
    // Reset to page 1 when filters change
    newParams.set("page", "1");
    router.push(`/shop?${newParams.toString()}`);
  };

  return { activeFilters, updateFilters };
};

