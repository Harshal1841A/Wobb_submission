import { useNavigate } from "react-router-dom";
import type { Platform, UserProfileSummary } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { AddToListButton } from "./AddToListButton";
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src={profile.picture}
          alt={`${profile.fullname}'s profile picture`}
          className="w-12 h-12 rounded-full object-cover shrink-0"
          style={{ border: "1px solid var(--border-strong)" }}
          loading="lazy"
        />
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-1 font-semibold truncate" style={{ color: "var(--text)" }}>
            <span className="truncate">@{profile.username}</span>
            <VerifiedBadge verified={profile.is_verified} />
          </div>
          <div className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
            {profile.fullname}
          </div>
        </div>
        <AddToListButton profile={profile} platform={platform} stopPropagation />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "var(--text)" }}>
          {formatCount(profile.followers)}
          <span className="ml-1" style={{ color: "var(--text-faint)" }}>followers</span>
        </span>
        <span style={{ color: "var(--text)" }}>{formatEngagementRate(profile.engagement_rate)}</span>
      </div>

      {/* Engagement heat bar — signature element, encodes real engagement_rate data */}
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
        role="img"
        aria-label={`Engagement ${formatEngagementRate(profile.engagement_rate)}`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${heatPct}%`,
            background: "linear-gradient(90deg, var(--accent-border), var(--accent))",
          }}
        />
      </div>
    </div>
  );
}
