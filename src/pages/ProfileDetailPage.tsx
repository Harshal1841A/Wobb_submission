import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AddToListButton } from "@/components/AddToListButton";
import { ShortlistPanel } from "@/components/ShortlistPanel";
import type { FullUserProfile, Platform, ProfileDetailResponse } from "@/types";
import { formatCount, formatEngagementRate, formatPlatformLabel } from "@/lib/formatters";
import { loadProfileByUsername } from "@/utils/profileLoader";

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
      <div className="text-xs" style={{ color: "var(--text-faint)" }}>{label}</div>
      <div className="font-semibold mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
    </div>
  );
}

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const platform = (searchParams.get("platform") || "unknown") as Platform | "unknown";
  const [profileData, setProfileData] = useState<ProfileDetailResponse | null>(null);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);

  useEffect(() => {
    if (!username) return;
    let active = true;
    loadProfileByUsername(username).then((data) => {
      if (!active) return; // ignore stale response if username changed mid-flight
      setProfileData(data);
      setFetchedFor(username);
    });
    return () => {
      active = false;
    };
  }, [username]);

  const loaded = fetchedFor === username;

  if (!username) {
    return (
      <Layout>
        <EmptyState message="Invalid profile" />
      </Layout>
    );
  }

  if (!loaded) {
    return (
      <Layout title={`@${username}`}>
        <div className="flex items-center justify-center py-24">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }}
            role="status"
            aria-label="Loading profile"
          />
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout title={`@${username}`}>
        <EmptyState message={`Could not load profile details for @${username}`} />
      </Layout>
    );
  }

  const user: FullUserProfile = profileData.data.user_profile;
  const knownPlatform: Platform = platform === "unknown" ? "instagram" : platform;

  return (
    <Layout title={user.fullname} onOpenShortlist={() => setShortlistOpen(true)}>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to search
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start max-w-2xl">
        <img
          src={user.picture}
          alt={`${user.fullname}'s profile picture`}
          className="w-24 h-24 rounded-full object-cover shrink-0"
          style={{ border: "1px solid var(--border-strong)" }}
        />
        <div className="flex-1 text-left min-w-0">
          <h2
            className="flex items-center gap-1.5 text-xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            @{user.username}
            <VerifiedBadge verified={user.is_verified} />
          </h2>
          <p style={{ color: "var(--text-muted)" }}>{user.fullname}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            {formatPlatformLabel(platform === "unknown" ? "" : platform) || "Unknown platform"}
          </p>

          {user.description && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {user.description}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Stat label="Followers" value={formatCount(user.followers)} />
            <Stat label="Engagement rate" value={formatEngagementRate(user.engagement_rate)} />
            {user.posts_count !== undefined && <Stat label="Posts" value={String(user.posts_count)} />}
            {user.avg_likes !== undefined && <Stat label="Avg likes" value={formatCount(user.avg_likes)} />}
            {user.avg_comments !== undefined && <Stat label="Avg comments" value={formatCount(user.avg_comments)} />}
            {user.avg_views !== undefined && user.avg_views > 0 && (
              <Stat label="Avg views" value={formatCount(user.avg_views)} />
            )}
            {user.engagements !== undefined && <Stat label="Engagements" value={formatCount(user.engagements)} />}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <AddToListButton profile={user} platform={knownPlatform} variant="full" />
            {user.url && (
              <a
                href={user.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                View on platform
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>

      <ShortlistPanel open={shortlistOpen} onClose={() => setShortlistOpen(false)} />
    </Layout>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p style={{ color: "var(--danger)" }}>{message}</p>
      <Link to="/" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
        Back to search
      </Link>
    </div>
  );
}
