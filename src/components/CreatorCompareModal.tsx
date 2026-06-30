import { useEffect, useState } from "react";
import { X, Trophy, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { formatCount, formatEngagementRate, formatPlatformLabel, formatPaidPerformance } from "@/lib/formatters";
import { Avatar } from "./Avatar";
import { VerifiedBadge } from "./VerifiedBadge";
import { Skeleton } from "./Skeleton";
import type { FullUserProfile } from "@/types";
import type { ShortlistEntry } from "@/store/shortlistStore";

export interface CreatorCompareModalProps {
  open: boolean;
  onClose: () => void;
  entries: ShortlistEntry[];
}

interface LoadedProfileData {
  entry: ShortlistEntry;
  fullProfile: FullUserProfile;
}

export function CreatorCompareModal({ open, onClose, entries }: CreatorCompareModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [loadedData, setLoadedData] = useState<LoadedProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || entries.length === 0) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setIsLoading(true);
    });

    Promise.all(
      entries.map(async (entry) => {
        const res = await loadProfileByUsername(entry.profile.username);
        const fullProfile: FullUserProfile = res?.data?.user_profile || {
          ...entry.profile,
        };
        return { entry, fullProfile };
      })
    ).then((results) => {
      if (!active) return;
      setLoadedData(results);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [open, entries]);

  if (!open) return null;

  // Find winners for quantitative metrics
  const maxFollowers = Math.max(...loadedData.map((d) => d.fullProfile.followers ?? 0));
  const maxEngRate = Math.max(...loadedData.map((d) => d.fullProfile.engagement_rate ?? 0));
  const maxViews = Math.max(...loadedData.map((d) => d.fullProfile.avg_views ?? 0));
  const maxLikes = Math.max(...loadedData.map((d) => d.fullProfile.avg_likes ?? 0));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          key="compare-backdrop"
          onClick={onClose}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="fixed inset-0 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.75)" }}
        />

        {/* Modal Window */}
        <motion.div
          key="compare-modal"
          role="dialog"
          aria-label="Head-to-Head Creator Comparison"
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl rounded-2xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-black text-white rounded-lg dark:bg-white dark:text-black">
                <Trophy size={18} />
              </div>
              <div>
                <h2
                  className="text-lg font-bold uppercase tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
                >
                  Head-to-Head Arena //
                </h2>
                <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  Cross-platform performance benchmark ({entries.length} creators)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison modal"
              className="p-2 rounded-lg border transition-colors hover:opacity-80 cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-x-auto overflow-y-auto flex-1 p-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-12">
                {Array.from({ length: entries.length }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : loadedData.length === 0 ? (
              <div className="py-16 text-center text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                No profile dossiers loaded.
              </div>
            ) : (
              <div
                className="grid gap-4 min-w-[600px]"
                style={{
                  gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${loadedData.length}, minmax(180px, 1fr))`,
                }}
              >
                {/* Row 1: Identity Cards */}
                <div className="flex flex-col justify-end pb-4 font-mono text-xs uppercase tracking-widest text-[var(--text-faint)]">
                  Creator Dossier
                </div>
                {loadedData.map(({ entry, fullProfile }) => (
                  <div
                    key={`${entry.platform}:${entry.profile.user_id}`}
                    className="p-4 rounded-xl border flex flex-col items-center text-center relative"
                    style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                  >
                    <span
                      className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    >
                      {formatPlatformLabel(entry.platform)}
                    </span>
                    <Avatar
                      src={fullProfile.picture}
                      name={fullProfile.fullname || fullProfile.username}
                      alt={fullProfile.fullname}
                      className="w-16 h-16 text-lg mb-3"
                    />
                    <div className="flex items-center justify-center gap-1 font-bold text-base w-full truncate" style={{ color: "var(--text)" }}>
                      <span className="truncate">@{fullProfile.username}</span>
                      <VerifiedBadge verified={fullProfile.is_verified} />
                    </div>
                    <p className="text-xs truncate w-full mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {fullProfile.fullname}
                    </p>
                    {fullProfile.url && (
                      <a
                        href={fullProfile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider hover:underline"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}

                {/* Metric Divider */}
                <div className="col-span-full border-t my-2" style={{ borderColor: "var(--border)" }} />

                {/* Metric Row: Followers */}
                <div className="flex items-center font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Audience Size
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const val = fullProfile.followers ?? 0;
                  const isWinner = val > 0 && val === maxFollowers && loadedData.length > 1;
                  return (
                    <div
                      key={`fol-${entry.platform}:${entry.profile.user_id}`}
                      className={`p-3.5 rounded-xl border flex flex-col justify-center transition-colors ${
                        isWinner ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15" : "bg-[var(--surface)] border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold" style={{ color: "var(--text)" }}>
                          {formatCount(val)}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white">
                            <Sparkles size={11} /> BEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-faint)" }}>
                        Followers
                      </span>
                    </div>
                  );
                })}

                {/* Metric Row: Engagement Rate */}
                <div className="flex items-center font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Engagement Rate
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const val = fullProfile.engagement_rate ?? 0;
                  const isWinner = val > 0 && val === maxEngRate && loadedData.length > 1;
                  return (
                    <div
                      key={`eng-${entry.platform}:${entry.profile.user_id}`}
                      className={`p-3.5 rounded-xl border flex flex-col justify-center transition-colors ${
                        isWinner ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15" : "bg-[var(--surface)] border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold" style={{ color: "var(--text)" }}>
                          {formatEngagementRate(val)}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white">
                            <Sparkles size={11} /> BEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-faint)" }}>
                        Rate
                      </span>
                    </div>
                  );
                })}

                {/* Metric Row: Avg Views */}
                <div className="flex items-center font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Avg Views
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const val = fullProfile.avg_views ?? 0;
                  const isWinner = val > 0 && val === maxViews && loadedData.length > 1;
                  return (
                    <div
                      key={`views-${entry.platform}:${entry.profile.user_id}`}
                      className={`p-3.5 rounded-xl border flex flex-col justify-center transition-colors ${
                        isWinner ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15" : "bg-[var(--surface)] border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold" style={{ color: "var(--text)" }}>
                          {val > 0 ? formatCount(val) : "N/A"}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white">
                            <Sparkles size={11} /> BEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-faint)" }}>
                        Per Post
                      </span>
                    </div>
                  );
                })}

                {/* Metric Row: Avg Likes */}
                <div className="flex items-center font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Avg Likes
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const val = fullProfile.avg_likes ?? fullProfile.engagements ?? 0;
                  const isWinner = val > 0 && val === maxLikes && loadedData.length > 1;
                  return (
                    <div
                      key={`likes-${entry.platform}:${entry.profile.user_id}`}
                      className={`p-3.5 rounded-xl border flex flex-col justify-center transition-colors ${
                        isWinner ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15" : "bg-[var(--surface)] border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold" style={{ color: "var(--text)" }}>
                          {val > 0 ? formatCount(val) : "N/A"}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white">
                            <Sparkles size={11} /> BEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-faint)" }}>
                        Interactions
                      </span>
                    </div>
                  );
                })}

                {/* Metric Row: Paid Performance Signal */}
                <div className="flex items-center font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Paid Signal
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const perf = fullProfile.paid_post_performance;
                  return (
                    <div
                      key={`paid-${entry.platform}:${entry.profile.user_id}`}
                      className="p-3.5 rounded-xl border flex flex-col justify-center"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      {perf !== undefined ? (
                        <>
                          <div className={`font-mono font-bold text-sm ${formatPaidPerformance(perf).tintClass}`}>
                            {formatPaidPerformance(perf).label}
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-faint)" }}>
                            Commercial tier
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-[var(--text-faint)]">No data</span>
                      )}
                    </div>
                  );
                })}

                {/* Metric Row: Brand Affinities */}
                <div className="flex items-start pt-2 font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text)" }}>
                  Brand Affinities
                </div>
                {loadedData.map(({ fullProfile, entry }) => {
                  const brands = fullProfile.brand_affinity || [];
                  return (
                    <div
                      key={`brands-${entry.platform}:${entry.profile.user_id}`}
                      className="p-3.5 rounded-xl border flex flex-wrap gap-1.5 items-start content-start"
                      style={{ background: "var(--surface)", borderColor: "var(--border)", minHeight: "80px" }}
                    >
                      {brands.length > 0 ? (
                        brands.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded text-[10px] font-mono uppercase border bg-[var(--surface-raised)] text-[var(--text)]"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {b.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono text-[var(--text-faint)]">None verified</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex items-center justify-between gap-4 shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
          >
            <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
              Tip: Shortlist up to 4 creators to evaluate them head-to-head.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border transition-colors"
              style={{ background: "var(--text)", color: "var(--surface)", borderColor: "var(--text)" }}
            >
              Done Comparing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
