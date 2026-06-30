import { useState, useMemo, Suspense, lazy } from "react";
import { X, Trophy } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useShortlistStore } from "@/store/shortlistStore";
import { formatPlatformLabel } from "@/lib/formatters";
import type { Platform } from "@/types";
import { PLATFORMS } from "@/utils/dataHelpers";

const ShortlistDragList = lazy(() => import("./ShortlistDragList").then((m) => ({ default: m.ShortlistDragList })));
const CreatorCompareModal = lazy(() => import("./CreatorCompareModal").then((m) => ({ default: m.CreatorCompareModal })));

interface ShortlistPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ShortlistPanel({ open, onClose }: ShortlistPanelProps) {
  const entries = useShortlistStore((s) => s.entries);
  const remove = useShortlistStore((s) => s.remove);
  const clear = useShortlistStore((s) => s.clear);
  const reorder = useShortlistStore((s) => s.reorder);
  const shouldReduceMotion = useReducedMotion();

  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [sortBy, setSortBy] = useState<"recent" | "followers">("recent");
  const [compareOpen, setCompareOpen] = useState(false);

  const isFilterActive = platformFilter !== "all" || sortBy !== "recent";

  const derivedEntries = useMemo(() => {
    let result = [...entries];
    if (platformFilter !== "all") {
      result = result.filter((e) => e.platform === platformFilter);
    }
    if (sortBy === "followers") {
      result.sort((a, b) => (b.profile.followers ?? 0) - (a.profile.followers ?? 0));
    }
    return result;
  }, [entries, platformFilter, sortBy]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            onClick={onClose}
            aria-hidden="true"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)" }}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Shortlisted profiles"
            initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col"
            style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-5 h-16 border-b shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="font-semibold text-lg italic tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
              >
                Dossier Selection
                <span className="ml-2 font-mono not-italic text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                  [{entries.length}]
                </span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shortlist"
                className="p-1.5 cursor-pointer transition-colors hover:opacity-80 border"
                style={{ color: "var(--text)", borderColor: "var(--border)" }}
              >
                <X size={18} />
              </button>
            </div>

            {entries.length > 0 && (
              <div
                className="flex flex-col gap-3 px-4 py-3 border-b shrink-0"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div
                    role="tablist"
                    aria-label="Filter shortlist by platform"
                    className="flex gap-1 p-1 w-fit border"
                    style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                  >
                    {(["all", ...PLATFORMS] as const).map((p) => {
                      const isSelected = platformFilter === p;
                      const label = p === "all" ? "All" : formatPlatformLabel(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setPlatformFilter(p)}
                          className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider cursor-pointer transition-all"
                          style={
                            isSelected
                              ? { background: "var(--accent)", color: "var(--on-accent)" }
                              : { background: "transparent", color: "var(--text-muted)" }
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <select
                    aria-label="Sort shortlist"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "recent" | "followers")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer outline-none shrink-0"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="recent">Recently added</option>
                    <option value="followers">Most followers</option>
                  </select>
                </div>

                {isFilterActive && (
                  <p
                    className="text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Drag-to-reorder is disabled while sorting or filtering is active.</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <AnimatePresence mode="wait">
                {entries.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                    className="flex flex-col items-center justify-center h-full text-center px-6 gap-2"
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      Your shortlist is empty
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                      Add profiles from search results to build your list.
                    </p>
                  </motion.div>
                ) : derivedEntries.length === 0 ? (
                  <motion.div
                    key="no-matches"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                    className="flex flex-col items-center justify-center py-12 text-center px-6 gap-2"
                  >
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      No matching profiles
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                      Try changing your filter controls above.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-container"
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, x: 20 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                  >
                    <Suspense fallback={<div className="py-8 text-center text-sm text-[var(--text-faint)]">Loading shortlist...</div>}>
                      <ShortlistDragList
                        entries={derivedEntries}
                        isFilterActive={isFilterActive}
                        onReorder={reorder}
                        onClose={onClose}
                        onRemove={remove}
                      />
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {entries.length > 0 && (
              <div className="p-4 border-t flex flex-col gap-2.5 shrink-0" style={{ borderColor: "var(--border)" }}>
                {derivedEntries.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setCompareOpen(true)}
                    className="w-full py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                    style={{
                      background: "var(--text)",
                      color: "var(--surface)",
                      border: "1px solid var(--text)",
                    }}
                  >
                    <Trophy size={15} />
                    <span>Compare Top ({Math.min(derivedEntries.length, 4)}) Head-to-Head</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={clear}
                  className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-muted)",
                  }}
                >
                  Clear shortlist
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
      <Suspense fallback={null}>
        <CreatorCompareModal
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          entries={derivedEntries.slice(0, 4)}
        />
      </Suspense>
    </AnimatePresence>
  );
}

