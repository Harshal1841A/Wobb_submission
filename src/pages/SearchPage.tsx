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
      <div className="mb-10 pb-8 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase border"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
          >
            Directory // Vol. IV
          </span>
          <span className="text-[11px] font-mono tracking-wider uppercase" style={{ color: "var(--text-faint)" }}>
            Verified Creator Dossier
          </span>
        </div>
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Curated <span className="italic font-normal">Intelligence.</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl font-light leading-relaxed" style={{ color: "var(--text-muted)" }}>
          An uncompromising editorial index of global influence. Explore verified metrics, audience provenance, and campaign performance across Instagram, YouTube, and TikTok.
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

      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs" style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          Showing {filtered.length} of {allProfiles.length}
        </p>
      </div>

      <ProfileList profiles={filtered} platform={platform} />

      <ShortlistPanel open={shortlistOpen} onClose={() => setShortlistOpen(false)} />
    </Layout>
  );
}
