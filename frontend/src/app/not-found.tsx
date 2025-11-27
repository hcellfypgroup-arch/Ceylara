import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="font-serif text-[120px] font-bold leading-none text-[var(--brand)] md:text-[180px]">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-12 space-y-4">
          <h2 className="font-serif text-3xl font-semibold text-[var(--foreground)] md:text-4xl">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-base text-[var(--muted)] md:text-lg">
            The page you're looking for seems to have wandered off. Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild variant="primary" size="lg" className="bg-[var(--accent)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300 active:scale-95
          ">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Shop
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
          <span className="h-px w-12 bg-[var(--border)]" />
          <span>CEYLARA</span>
          <span className="h-px w-12 bg-[var(--border)]" />
        </div>
      </div>
    </div>
  );
}

