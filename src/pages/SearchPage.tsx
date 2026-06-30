import { useState, useEffect, useMemo } from "react";
import type { Platform } from "@/types";
import { Layout } from "@/components/Layout";
import { PlatformFilter } from "@/components/PlatformFilter";
import { ProfileList } from "@/components/ProfileList";
import { ShortlistPanel } from "@/components/ShortlistPanel";
import { useProfileSearch } from "@/hooks/useProfileSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { loadBrandAffinityIndex } from "@/utils/profileLoader";

export function SearchPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [brandAffinityMap, setBrandAffinityMap] = useState<Record<string, string[]>>({});
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  useEffect(() => {
    loadBrandAffinityIndex().then((map) => {
      setBrandAffinityMap(map);
    });
  }, []);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    Object.values(brandAffinityMap).forEach((brands) => {
      brands.forEach((b) => set.add(b));
    });
    return Array.from(set).sort();
  }, [brandAffinityMap]);

  // Debounce so filtering doesn't run on every keystroke against the full list.
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  const { allProfiles, filtered } = useProfileSearch(platform, debouncedQuery, selectedBrand, brandAffinityMap);

  return (
    <Layout title="Find creators to shortlist" onOpenShortlist={() => setShortlistOpen(true)}>
      <div className="mb-6">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Find your next creator
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Browse top accounts across Instagram, YouTube, and TikTok — shortlist the ones worth a closer look.
        </p>
      </div>

      <PlatformFilter
        selected={platform}
        onChange={(p) => {
          setPlatform(p);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-xs" style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          Showing {filtered.length} of {allProfiles.length}
        </p>
        {allBrands.length > 0 && (
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <label htmlFor="brand-affinity-filter" className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                Filter by brand affinity:
              </label>
              <select
                id="brand-affinity-filter"
                aria-label="Filter by brand affinity (All)"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm outline-none cursor-pointer"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="All">Filter by brand affinity (All)</option>
                {allBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
              Filters against sample brand mentions in mock data — try Nike or Gymshark
            </p>
          </div>
        )}
      </div>

      <ProfileList profiles={filtered} platform={platform} />

      <ShortlistPanel open={shortlistOpen} onClose={() => setShortlistOpen(false)} />
    </Layout>
  );
}
