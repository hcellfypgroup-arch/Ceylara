"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
};

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [active, setActive] = useState(0);
  
  // Handle empty or invalid images array
  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--accent)] aspect-[3/4] flex items-center justify-center">
          <p className="text-[var(--muted)]">No images available</p>
        </div>
      </div>
    );
  }

  const display = images[active] ?? images[0];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-[var(--radius-lg)] sm:rounded-[var(--radius-xl)] border border-[var(--border)]">
        <Image
          src={display}
          alt="Product media"
          width={720}
          height={960}
          className="aspect-[3/4] w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {images.map((image, index) => (
            <button
              key={image}
              className={cn(
                "min-w-16 sm:min-w-20 overflow-hidden rounded-[var(--radius-sm)] sm:rounded-[var(--radius-md)] border flex-shrink-0 snap-start touch-manipulation",
                index === active
                  ? "border-[var(--foreground)] ring-2 ring-[var(--foreground)] ring-offset-1"
                  : "border-[var(--border)]"
              )}
              onClick={() => setActive(index)}
            >
              <Image
                src={image}
                alt="Thumbnail"
                width={160}
                height={160}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

