import { useState, useMemo } from "react";
import { X, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useShortlistStore } from "@/store/shortlistStore";
import { formatCount, formatPlatformLabel } from "@/lib/formatters";
import type { Platform } from "@/types";
import { PLATFORMS } from "@/utils/dataHelpers";

interface ShortlistPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ShortlistPanel({ open, onClose }: ShortlistPanelProps) {
  const entries = useShortlistStore((s) => s.entries);
  const remove = useShortlistStore((s) => s.remove);
  const clear = useShortlistStore((s) => s.clear);
  const reorder = useShortlistStore((s) => s.reorder);

  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [sortBy, setSortBy] = useState<"recent" | "followers">("recent");

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

  const handleDragEnd = (result: DropResult) => {
    if (isFilterActive) return;
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    reorder(result.source.index, result.destination.index);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.6)" }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shortlisted profiles"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col transition-transform duration-250 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 h-16 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="font-semibold text-base"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Shortlist
            <span className="ml-2 font-normal text-sm" style={{ color: "var(--text-muted)" }}>
              {entries.length} {entries.length === 1 ? "profile" : "profiles"}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortlist"
            className="p-1.5 rounded-md cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
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
                className="flex gap-1 p-1 rounded-lg w-fit"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
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
                      className="px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all"
                      style={
                        isSelected
                          ? { background: "var(--accent)", color: "#0b0b10" }
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
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Your shortlist is empty
              </p>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Add profiles from search results to build your list.
              </p>
            </div>
          ) : derivedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6 gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                No matching profiles
              </p>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Try changing your filter controls above.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="shortlist" isDropDisabled={isFilterActive}>
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-2"
                  >
                    {derivedEntries.map(({ profile, platform }, index) => {
                      const key = `${platform}:${profile.user_id}`;
                      return (
                        <Draggable key={key} draggableId={key} index={index} isDragDisabled={isFilterActive}>
                          {(dragProvided) => (
                            <li
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className="flex items-center gap-3 p-2.5 rounded-xl group"
                              style={{
                                background: "var(--surface-raised)",
                                ...dragProvided.draggableProps.style,
                              }}
                            >
                              {isFilterActive ? (
                                <div
                                  className="p-1 -ml-1 opacity-20 cursor-not-allowed"
                                  title="Reordering disabled while filtered or sorted"
                                  style={{ color: "var(--text-faint)" }}
                                >
                                  <GripVertical size={16} />
                                </div>
                              ) : (
                                <div
                                  {...dragProvided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 -ml-1 transition-colors hover:opacity-80"
                                  style={{ color: "var(--text-faint)" }}
                                  aria-label="Drag to reorder"
                                >
                                  <GripVertical size={16} />
                                </div>
                              )}
                              <img
                                src={profile.picture}
                                alt={`${profile.fullname} avatar`}
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                                style={{ border: "1px solid var(--border-strong)" }}
                                loading="lazy"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/profile/${profile.username}?platform=${platform}`}
                                  onClick={onClose}
                                  className="text-sm font-medium truncate block hover:underline"
                                  style={{ color: "var(--text)" }}
                                >
                                  @{profile.username}
                                </Link>
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                                >
                                  {formatPlatformLabel(platform)} · {formatCount(profile.followers)}
                                </p>
                              </div>
                              <a
                                href={profile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open @${profile.username} on ${platform}`}
                                className="p-1.5 rounded-md shrink-0 transition-colors hover:opacity-80"
                                style={{ color: "var(--text-faint)" }}
                              >
                                <ExternalLink size={15} />
                              </a>
                              <button
                                type="button"
                                onClick={() => remove(profile.user_id, platform)}
                                aria-label={`Remove @${profile.username} from shortlist`}
                                className="p-1.5 rounded-md shrink-0 transition-colors hover:opacity-80 cursor-pointer"
                                style={{ color: "var(--text-faint)" }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {entries.length > 0 && (
          <div className="p-4 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
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
      </aside>
    </>
  );
}
