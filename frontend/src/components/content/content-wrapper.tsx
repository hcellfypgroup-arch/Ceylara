type ContentWrapperProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const ContentWrapper = ({
  title,
  description,
  children,
}: ContentWrapperProps) => (
  <section className="section">
    <div className="container space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Information
        </p>
        <h1 className="text-4xl font-semibold">{title}</h1>
        {description && (
          <p className="mt-3 text-lg text-[var(--muted)]">{description}</p>
        )}
      </div>
      <article className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-8 text-[var(--foreground)]">
        {children}
      </article>
    </div>
  </section>
);

