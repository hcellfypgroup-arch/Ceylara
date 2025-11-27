import { Badge } from "@/components/ui/badge";

type ReviewListProps = {
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
};

export const ReviewList = ({ reviews }: ReviewListProps) => (
  <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Reviews
        </p>
        <h3 className="text-2xl font-semibold text-[var(--foreground)]">
          {reviews.length} Reviews
        </h3>
      </div>
      <Badge tone="brand">4.8 / 5</Badge>
    </div>
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="space-y-2 border-b border-[var(--border)] pb-4">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">{review.name}</p>
            <span className="text-[var(--muted)]">{review.createdAt}</span>
          </div>
          <div className="text-sm text-[var(--muted)]">{review.comment}</div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index < review.rating ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
);

