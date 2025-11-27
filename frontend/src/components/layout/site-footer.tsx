import Link from "next/link";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Return & Refund", href: "/return-refund" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Shipping", href: "/shipping" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

export const SiteFooter = () => (
  <footer className="border-t border-[var(--border)] bg-white py-4">
    <div className="container py-16 lg:py-20">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            CEYLARA
          </p>
          <p className="text-sm text-[var(--muted)]">
            Contemporary womenswear with an emphasis on elevated essentials,
            modest silhouettes, and timeless prints.
          </p>
          <div className="flex items-center gap-2">
            {["Instagram", "Pinterest", "YouTube"].map((network) => (
              <span
                key={network}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
              >
                {network}
              </span>
            ))}
          </div>
        </div>
        {footerLinks.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
              {section.title}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-[var(--foreground)] transition hover:text-[var(--brand)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} CEYLARA. All Rights Reserved.</p>
        <p>Secure payments via Visa, Mastercard.</p>
      </div>
    </div>
  </footer>
);

