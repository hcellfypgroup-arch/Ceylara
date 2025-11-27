import { SearchHero } from "@/components/search/search-hero";
import { SearchResults } from "@/components/search/search-results";
import { db } from "@/lib/db";

async function performSearch(query: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      return { products: [], categories: [], query };
    }
    
    const { data } = await response.json();
    return data || { products: [], categories: [], query };
  } catch (error) {
    console.error("Search failed:", error);
    return { products: [], categories: [], query };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  
  let searchResults = { products: [], categories: [], query: "" };
  
  if (query) {
    await db.connect();
    searchResults = await performSearch(query);
  }

  return (
    <>
      <SearchHero initialQuery={query} />
      {query && (
        <SearchResults
          products={searchResults.products}
          categories={searchResults.categories}
          query={searchResults.query}
        />
      )}
    </>
  );
}

