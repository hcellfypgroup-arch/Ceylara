"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const SearchHero = ({ initialQuery }: { initialQuery?: string }) => {
  const [query, setQuery] = useState(initialQuery || "");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="section">
      <div className="container space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          Search
        </p>
        <h1 className="text-4xl font-semibold text-[var(--foreground)]">
          Find designs by title, SKU, color, or category
        </h1>
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl gap-2">
          <Input
            placeholder="Search for saree, SKU, color…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gap-2">
            <Search className="size-4" />
            Search
          </Button>
        </form>
        <p className="text-sm text-[var(--muted)]">
          
        </p>
      </div>
    </section>
  );
};
