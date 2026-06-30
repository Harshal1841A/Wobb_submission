import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { AddToListButton } from "./AddToListButton";
import { Avatar } from "./Avatar";
import { formatCount, formatEngagementRate } from "@/lib/formatters";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
}

/** Engagement heat bar: width encodes engagement_rate against a realistic ceiling. */
function engagementHeatPct(rate: number | undefined): number {
  if (rate === undefined) return 0;
  const pct = rate * 100;
  const ceiling = 8; // 8%+ engagement is exceptional for the platforms in scope
  return Math.max(2, Math.min(100, (pct / ceiling) * 100));
}

export function ProfileCard({ profile, platform }: ProfileCardProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleClick = () => {
    navigate(`/profile/${profile.username}?platform=${platform}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const heatPct = engagementHeatPct(profile.engagement_rate);
  const initialWidth = shouldReduceMotion ? false : { width: 0 };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col gap-4 p-5 cursor-pointer transition-all duration-200 border hover:border-black"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar
            src={profile.picture}
            name={profile.fullname || profile.username}
            alt={`${profile.fullname}'s profile picture`}
            className="w-12 h-12 text-sm rounded-none border border-stone-200"
          />
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1.5 font-normal text-lg tracking-tight truncate" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
              <span className="truncate italic font-medium">{profile.fullname || profile.username}</span>
              <VerifiedBadge verified={profile.is_verified} />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wider truncate" style={{ color: "var(--text-muted)" }}>
              @{profile.username}
            </div>
          </div>
        </div>
        <AddToListButton profile={profile} platform={platform} stopPropagation />
      </div>

      <div className="pt-3 border-t flex items-center justify-between gap-3 text-xs" style={{ borderColor: "var(--surface-raised)", fontFamily: "var(--font-mono)" }}>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Audience</span>
          <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{formatCount(profile.followers)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Engagement</span>
          <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{formatEngagementRate(profile.engagement_rate)}</span>
        </div>
      </div>

      {/* Editorial Monochrome Index Bar */}
      <div
        className="h-[2px] w-full overflow-hidden"
        style={{ background: "var(--surface-raised)" }}
        role="img"
        aria-label={`Engagement ${formatEngagementRate(profile.engagement_rate)}`}
      >
        <motion.div
          className="h-full"
          initial={initialWidth}
          animate={{ width: `${heatPct}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
          style={{
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}


