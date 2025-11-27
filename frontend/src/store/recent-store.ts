"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentItem = {
  productId: string;
  title: string;
  href: string;
  image?: string;
  viewedAt: number;
};

type RecentState = {
  items: RecentItem[];
  add: (entry: Omit<RecentItem, "viewedAt">) => void;
  clear: () => void;
};

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (entry) => {
        const filtered = get().items.filter(
          (item) => item.productId !== entry.productId
        );
        const next = [
          { ...entry, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, 12);
        set({ items: next });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "selara-recent",
    }
  )
);

