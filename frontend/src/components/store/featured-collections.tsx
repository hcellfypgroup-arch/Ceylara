import Link from "next/link";
import Image from "next/image";
import { featuredCollections } from "@/data/mock-data";

export const FeaturedCollections = () => (
  <section className="section">
    <div className="container space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Featured Collections
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold">Seasonal capsules</h2>
        </div>
        <Link href="/shop" className="text-xs sm:text-sm underline">
          Explore all
        </Link>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {featuredCollections.map((collection) => (
          <article
            key={collection.title}
            className="group overflow-hidden rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] border border-[var(--border)] bg-white"
          >
            <Image
              src={collection.image}
              alt={collection.title}
              width={600}
              height={400}
              className="h-56 sm:h-64 md:h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="space-y-1.5 sm:space-y-2 p-4 sm:p-5 md:p-6">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
                Capsule
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">
                {collection.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                {collection.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

