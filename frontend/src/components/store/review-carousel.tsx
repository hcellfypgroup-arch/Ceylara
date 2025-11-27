"use client";

import { useState } from "react";
import { testimonials } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const ReviewCarousel = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="section bg-white">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Voices
            </p>
            <h2 className="text-3xl font-semibold">Customer reviews</h2>
          </div>
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "size-2 rounded-full bg-[var(--border)] transition",
                  index === active && "bg-[var(--foreground)]"
                )}
                onClick={() => setActive(index)}
                aria-label={`Show review ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((review, index) => (
            <article
              key={review.name}
              className={cn(
                "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] transition",
                index === active ? "opacity-100" : "opacity-70"
              )}
            >
              <Badge tone="brand" className="mb-4">
                {review.rating} rating
              </Badge>
              <p className="text-lg font-medium text-[var(--foreground)]">
                “{review.comment}”
              </p>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {review.name}, {review.location}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

