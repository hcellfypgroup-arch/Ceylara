type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl space-y-2">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold text-[var(--foreground)]">{title}</h2>
      {description && (
        <p className="text-base text-[var(--muted)]">{description}</p>
      )}
    </div>
    {action}
  </div>
);

