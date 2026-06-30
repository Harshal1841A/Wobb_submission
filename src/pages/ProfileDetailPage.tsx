import { useEffect, useState, Suspense, lazy } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Layout } from "@/components/Layout";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AddToListButton } from "@/components/AddToListButton";
import { ShortlistPanel } from "@/components/ShortlistPanel";
import { SimilarCreatorsRail } from "@/components/SimilarCreatorsRail";
import { Avatar } from "@/components/Avatar";
import type { FullUserProfile, Platform, ProfileDetailResponse } from "@/types";
import { formatCount, formatEngagementRate, formatPlatformLabel, formatPaidPerformance } from "@/lib/formatters";
import { loadProfileByUsername } from "@/utils/profileLoader";
import { Skeleton } from "@/components/Skeleton";

const GrowthChart = lazy(() => import("@/components/GrowthChart").then((m) => ({ default: m.GrowthChart })));
const PitchButton = lazy(() => import("@/components/PitchButton").then((m) => ({ default: m.PitchButton })));

function CopyShareButton() {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors hover:border-[var(--border-strong)]"
      style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}
      aria-label="Copy profile link"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="text-[var(--verified)] flex items-center gap-1"
          >
            <Check size={14} />
            <span>Copied!</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="flex items-center gap-1 text-[var(--text-muted)]"
          >
            <Copy size={14} />
            <span>Share link</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!username) return;
    window.scrollTo?.(0, 0);
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
        <div role="status" aria-label="Loading profile">
          <div className="inline-flex items-center gap-1.5 text-sm mb-6 opacity-40">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to search</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start max-w-2xl">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="flex-1 text-left min-w-0 w-full">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <GrowthChart isLoading={true} />
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout title={`@${username}`}>
        <MissingProfileState username={username} />
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
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.05, rotate: 3 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0 cursor-pointer"
        >
          <Avatar
            src={user.picture}
            name={user.fullname || user.username}
            alt={`${user.fullname}'s profile picture`}
            className="w-24 h-24 text-2xl"
          />
        </motion.div>
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
            {user.paid_post_performance !== undefined && (
              <div
                className="p-3 rounded-xl border-l-2 border-l-[var(--verified)]"
                style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--border)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-faint)" }}>
                  <span>Paid signal</span>
                  <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-[var(--verified)] text-[#0b0b10]">PRO</span>
                </div>
                <div className={`font-semibold mt-0.5 text-xs sm:text-sm ${formatPaidPerformance(user.paid_post_performance).tintClass}`}>
                  {formatPaidPerformance(user.paid_post_performance).label}
                </div>
              </div>
            )}
          </div>

          {user.brand_affinity && user.brand_affinity.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2.5" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                Brand Affinities
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.brand_affinity.map((brand) => (
                  <span
                    key={brand.id}
                    className="rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]"
                  >
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Suspense
            fallback={
              <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <Skeleton className="h-5 w-48 mb-1.5" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-8 w-36 rounded-lg" />
                  </div>
                </div>
                <div className="h-64 w-full">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
              </div>
            }
          >
            <GrowthChart data={user.stat_history} />
          </Suspense>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <AddToListButton profile={user} platform={knownPlatform} variant="full" />
            <Suspense fallback={<Skeleton className="h-9 w-36 rounded-xl" />}>
              <PitchButton key={user.username} profile={user} platform={knownPlatform} />
            </Suspense>
            <CopyShareButton />
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

          {user.similar_users && user.similar_users.length > 0 && (
            <SimilarCreatorsRail similarUsers={user.similar_users} platform={knownPlatform} />
          )}
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

const AVAILABLE_SAMPLE_PROFILES = [
  { username: "cristiano", fullname: "Cristiano Ronaldo", platform: "instagram" },
  { username: "mrbeast", fullname: "MrBeast", platform: "tiktok" },
  { username: "khaby.lame", fullname: "Khabane Lame", platform: "tiktok" },
  { username: "instagram", fullname: "Instagram", platform: "instagram" },
  { username: "MrBeast6000", fullname: "MrBeast", platform: "youtube" },
  { username: "tseries", fullname: "T-Series", platform: "youtube" },
];

function MissingProfileState({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto py-12 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-xl font-bold"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        @
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
      >
        @{username}
      </h2>
      <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Detailed profile analytics for <span className="font-semibold" style={{ color: "var(--text)" }}>@{username}</span> are not included in this static demonstration dataset. Only spotlight creators have full historical data and AI pitching enabled.
      </p>

      <div
        className="w-full text-left rounded-2xl p-5 mb-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}
        >
          Explore Available Sample Profiles
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_SAMPLE_PROFILES.map((p) => (
            <Link
              key={p.username}
              to={`/profile/${p.username}?platform=${p.platform}`}
              className="flex items-center justify-between p-2.5 rounded-xl transition-colors hover:border-[var(--border-strong)]"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0 pr-2">
                <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                  @{p.username}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--text-faint)" }}>
                  {p.fullname}
                </div>
              </div>
              <span
                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                {p.platform}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors hover:border-[var(--border-strong)]"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to search
      </Link>
    </div>
  );
}
