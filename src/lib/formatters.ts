/**
 * Shared number/text formatters.
 * Single source of truth — previously this logic was duplicated (and
 * inconsistently buggy) across ProfileCard, ProfileDetailPage, and formatters.ts.
 */

/** Format a raw count (followers, views, likes) into a short human string. */
export function formatCount(count: number | undefined): string {
  if (count === undefined || Number.isNaN(count)) return "—";
  if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(1) + "B";
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
  return String(count);
}

/**
 * Engagement rate is stored as a fraction (e.g. 0.0246 === 2.46%).
 * Multiply by 100 — NOT 10000. (Original bug: ProfileDetailPage multiplied
 * by 10000, inflating every engagement rate 100x.)
 */
export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined || Number.isNaN(rate)) return "N/A";
  return (rate * 100).toFixed(2) + "%";
}

export function formatPlatformLabel(platform: string): string {
  switch (platform) {
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default:
      return platform;
  }
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/** Format a "YYYY-MM" string into "MMM YYYY" (e.g. "2023-02" -> "Feb 2023"). */
export function formatMonthLabel(monthStr: string): string {
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${MONTH_NAMES[monthIdx]} ${year}`;
  }
  return monthStr;
}

export interface PaidPerformanceResult {
  label: string;
  tintClass: string;
}

export function formatPaidPerformance(score: number | undefined): PaidPerformanceResult {
  if (score === undefined || Number.isNaN(score)) {
    return { label: "N/A", tintClass: "text-[var(--text-faint)]" };
  }
  if (score >= 1.2) {
    return { label: "Strong (+20% vs organic)", tintClass: "text-[var(--verified)]" };
  }
  if (score >= 0.8) {
    return { label: "On par with organic", tintClass: "text-[var(--text)]" };
  }
  return { label: "Underperforms organic", tintClass: "text-[var(--danger)]" };
}


