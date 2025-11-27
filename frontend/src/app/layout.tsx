import type { Metadata } from "next";
import { Sora, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeaderWrapper } from "@/components/layout/site-header-wrapper";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppProviders } from "@/components/providers/app-providers";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEYLARA — Womenswear boutique",
  description: "Elevated womenswear across dresses, abayas, sarees, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AppProviders>
          <ConditionalLayout header={<SiteHeaderWrapper />}>
            {children}
          </ConditionalLayout>
        </AppProviders>
      </body>
    </html>
  );
}
