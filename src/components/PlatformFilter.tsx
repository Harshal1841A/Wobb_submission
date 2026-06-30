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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div
        role="tablist"
        aria-label="Filter by platform"
        className="flex gap-1 p-1 w-full sm:w-fit border overflow-x-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
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
              className="px-5 py-2 text-xs uppercase tracking-widest font-semibold cursor-pointer transition-all"
              style={
                isSelected
                  ? { background: "var(--accent)", color: "var(--on-accent)" }
                  : { background: "transparent", color: "var(--text-muted)" }
              }
            >
              {formatPlatformLabel(p)}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 sm:max-w-xs">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
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
          placeholder="Filter dossier by name..."
          className="w-full pl-10 pr-4 py-2.5 text-xs font-mono tracking-wider outline-none border transition-colors focus:border-black"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        />
      </div>
    </div>
  );
}
