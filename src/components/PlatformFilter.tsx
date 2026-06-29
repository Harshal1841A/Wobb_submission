import { Search } from "lucide-react";
import type { Platform } from "@/types";
import { PLATFORMS } from "@/utils/dataHelpers";
import { formatPlatformLabel } from "@/lib/formatters";

interface PlatformFilterProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PlatformFilter({
  selected,
  onChange,
  searchQuery,
  onSearchChange,
}: PlatformFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div
        role="tablist"
        aria-label="Filter by platform"
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {PLATFORMS.map((p) => {
          const isSelected = selected === p;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
              style={
                isSelected
                  ? { background: "var(--accent)", color: "#0b0b10" }
                  : { background: "transparent", color: "var(--text-muted)" }
              }
            >
              {formatPlatformLabel(p)}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-faint)" }}
          aria-hidden="true"
        />
        <label htmlFor="profile-search" className="sr-only">
          Search by username or full name
        </label>
        <input
          id="profile-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by username or name…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>
    </div>
  );
}
