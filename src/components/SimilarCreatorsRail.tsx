import { useNavigate } from "react-router-dom";
import type { FullUserProfile, Platform } from "@/types";
import { VerifiedBadge } from "./VerifiedBadge";
import { Avatar } from "./Avatar";
import { formatCount, formatEngagementRate } from "@/lib/formatters";

interface SimilarCreatorsRailProps {
  similarUsers: NonNullable<FullUserProfile["similar_users"]>;
  platform: Platform;
}

function engagementHeatPct(rate: number | undefined): number {
  if (rate === undefined) return 0;
  const pct = rate * 100;
  const ceiling = 8;
  return Math.max(2, Math.min(100, (pct / ceiling) * 100));
}

export function SimilarCreatorsRail({ similarUsers, platform }: SimilarCreatorsRailProps) {
  const navigate = useNavigate();

  if (similarUsers.length === 0) return null;

  return (
    <div className="mt-8">
      <h3
        className="text-lg font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
      >
        Similar Creators
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin">
        {similarUsers.map((user) => {
          const rate =
            user.engagement_rate !== undefined
              ? user.engagement_rate
              : user.engagements !== undefined && user.followers > 0
              ? user.engagements / user.followers
              : undefined;
          const heatPct = engagementHeatPct(rate);

          const handleClick = () => {
            navigate(`/profile/${user.username}?platform=${platform}`);
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          };

          return (
            <div
              key={user.user_id || user.username}
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              className="shrink-0 w-64 p-4 rounded-2xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between gap-3"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={user.picture}
                  name={user.fullname || user.username}
                  alt={`${user.fullname}'s picture`}
                  className="w-10 h-10 text-xs"
                />
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center gap-1 font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                    <span className="truncate">@{user.username}</span>
                    <VerifiedBadge verified={Boolean(user.is_verified)} />
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {user.fullname}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "var(--text)" }}>
                  {formatCount(user.followers)} <span style={{ color: "var(--text-faint)" }}>followers</span>
                </span>
                <span style={{ color: "var(--text)" }}>{formatEngagementRate(rate)}</span>
              </div>

              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ background: "var(--border)" }}
                role="img"
                aria-label={`Engagement ${formatEngagementRate(rate)}`}
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
        })}
      </div>
    </div>
  );
}
