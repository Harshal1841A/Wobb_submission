import { Link } from "react-router-dom";
import { ExternalLink, GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { formatCount, formatPlatformLabel } from "@/lib/formatters";
import type { Platform, UserProfileSummary } from "@/types";

export interface ShortlistEntry {
  profile: UserProfileSummary;
  platform: Platform;
  addedAt: number;
}

export interface ShortlistDragListProps {
  entries: ShortlistEntry[];
  isFilterActive: boolean;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onClose: () => void;
  onRemove: (userId: string, platform: Platform) => void;
}

export function ShortlistDragList({
  entries,
  isFilterActive,
  onReorder,
  onClose,
  onRemove,
}: ShortlistDragListProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleDragEnd = (result: DropResult) => {
    if (isFilterActive) return;
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="shortlist" isDropDisabled={isFilterActive}>
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col"
          >
            <AnimatePresence initial={false}>
              {entries.map(({ profile, platform }, index) => {
                const key = `${platform}:${profile.user_id}`;
                return (
                  <Draggable key={key} draggableId={key} index={index} isDragDisabled={isFilterActive}>
                    {(dragProvided) => (
                      <li
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        style={dragProvided.draggableProps.style}
                      >
                        <motion.div
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0, x: 20 }}
                          animate={{ opacity: 1, height: "auto", x: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, x: 20 }}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                          className="flex items-center gap-3 p-2.5 rounded-xl group overflow-hidden mb-2"
                          style={{ background: "var(--surface-raised)" }}
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
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/fallback-avatar.svg";
                            }}
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
                          {profile.url && (
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
                          )}
                          <button
                            type="button"
                            onClick={() => onRemove(profile.user_id, platform)}
                            aria-label={`Remove @${profile.username} from shortlist`}
                            className="p-1.5 rounded-md shrink-0 transition-colors hover:opacity-80 cursor-pointer"
                            style={{ color: "var(--text-faint)" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </motion.div>
                      </li>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </AnimatePresence>
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
