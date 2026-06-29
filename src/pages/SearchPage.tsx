import { useState } from "react";
import type { Platform } from "@/types";
import { Layout } from "@/components/Layout";
import { PlatformFilter } from "@/components/PlatformFilter";
import { ProfileList } from "@/components/ProfileList";
import { ShortlistPanel } from "@/components/ShortlistPanel";
import { useProfileSearch } from "@/hooks/useProfileSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function SearchPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [shortlistOpen, setShortlistOpen] = useState(false);

  // Debounce so filtering doesn't run on every keystroke against the full list.
  const debouncedQuery = useDebouncedValue(searchQuery, 150);
  const { allProfiles, filtered } = useProfileSearch(platform, debouncedQuery);

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

      <p className="text-xs mb-4" style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        Showing {filtered.length} of {allProfiles.length}
      </p>

      <ProfileList profiles={filtered} platform={platform} />

      <ShortlistPanel open={shortlistOpen} onClose={() => setShortlistOpen(false)} />
    </Layout>
  );
}
