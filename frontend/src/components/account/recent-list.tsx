"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

type RecentItem = {
  productId: string;
  title: string;
  slug: string;
  image?: string;
  price: number;
  viewedAt: string;
};

export const RecentList = () => {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/account/recent");
      if (response.ok) {
        const { data } = await response.json();
        setItems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch recently viewed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
        <p className="text-lg font-semibold">No recently viewed items</p>
        <p className="text-sm text-[var(--muted)] mt-2">
          Browse the shop to start building your history.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.productId}
          href={`/products/${item.slug}`}
          className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
        >
          <div className="relative overflow-hidden rounded-[var(--radius-md)]">
            <Image
              src={item.image || "/placeholder-product.jpg"}
              alt={item.title}
              width={400}
              height={520}
              className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={item.image?.startsWith("http")}
            />
          </div>
          <p className="mt-3 font-medium text-[var(--foreground)]">{item.title}</p>
          <p className="text-sm font-semibold text-[var(--foreground)] mt-1">
            {formatCurrency(item.price)}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Viewed {new Date(item.viewedAt).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  );
};

