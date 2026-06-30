import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";
import { SearchX } from "lucide-react";
import { useWindowVirtualizer, defaultRangeExtractor } from "@tanstack/react-virtual";

export const VIRTUALIZE_THRESHOLD = 30;

interface ProfileListProps {
  profiles: UserProfileSummary[];
  platform: Platform;
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  userId?: string;
}

function AnimatedListItem({ children, index, userId }: AnimatedListItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const delay = shouldReduceMotion ? 0 : index < 20 ? index * 0.03 : 0;

  return (
    <motion.li
      data-userid={userId}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.2,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.li>
  );
}

function useColumnCount() {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  });

  useEffect(() => {
    const mqlLg = window.matchMedia("(min-width: 1024px)");
    const mqlSm = window.matchMedia("(min-width: 640px)");

    const update = () => {
      if (mqlLg.matches) setColumns(3);
      else if (mqlSm.matches) setColumns(2);
      else setColumns(1);
    };

    mqlLg.addEventListener("change", update);
    mqlSm.addEventListener("change", update);

    return () => {
      mqlLg.removeEventListener("change", update);
      mqlSm.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

function VirtualizedProfileGrid({ profiles, platform }: ProfileListProps) {
  const columns = useColumnCount();

  const rows = useMemo(() => {
    const chunks: UserProfileSummary[][] = [];
    for (let i = 0; i < profiles.length; i += columns) {
      chunks.push(profiles.slice(i, i + columns));
    }
    return chunks;
  }, [profiles, columns]);

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  const focusedRowIndex = useMemo(() => {
    if (!focusedUserId) return null;
    const idx = rows.findIndex((r) => r.some((p) => p.user_id === focusedUserId));
    return idx !== -1 ? idx : null;
  }, [rows, focusedUserId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const updateMargin = () => setScrollMargin(el.offsetTop);
    updateMargin();
    window.addEventListener("resize", updateMargin);
    return () => window.removeEventListener("resize", updateMargin);
  }, []);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 260,
    overscan: 5,
    scrollMargin,
    rangeExtractor: (range) => {
      const defaultRange = defaultRangeExtractor(range);
      if (focusedRowIndex !== null && !defaultRange.includes(focusedRowIndex)) {
        return [...defaultRange, focusedRowIndex].sort((a, b) => a - b);
      }
      return defaultRange;
    },
  });

  return (
    <div
      ref={listRef}
      onFocusCapture={(e) => {
        const el = (e.target as HTMLElement).closest("[data-userid]");
        if (el) {
          setFocusedUserId(el.getAttribute("data-userid"));
        }
      }}
      onBlurCapture={(e) => {
        const el = (e.target as HTMLElement).closest("[data-userid]");
        if (el && el.getAttribute("data-userid") === focusedUserId) {
          setFocusedUserId(null);
        }
      }}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowProfiles = rows[virtualRow.index];
        return (
          <ul
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0 pb-4"
          >
            {rowProfiles.map((profile, colIdx) => {
              const itemIndex = virtualRow.index * columns + colIdx;
              return (
                <AnimatedListItem key={profile.user_id} index={itemIndex} userId={profile.user_id}>
                  <ProfileCard profile={profile} platform={platform} />
                </AnimatedListItem>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}

export function ProfileList({ profiles, platform }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <SearchX size={28} style={{ color: "var(--text-faint)" }} aria-hidden="true" />
        <p className="font-medium" style={{ color: "var(--text)" }}>No profiles found</p>
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          Try a different search term or platform.
        </p>
      </div>
    );
  }

  if (profiles.length > VIRTUALIZE_THRESHOLD) {
    return <VirtualizedProfileGrid profiles={profiles} platform={platform} />;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
      {profiles.map((profile, index) => (
        <AnimatedListItem key={profile.user_id} index={index} userId={profile.user_id}>
          <ProfileCard profile={profile} platform={platform} />
        </AnimatedListItem>
      ))}
    </ul>
  );
}

