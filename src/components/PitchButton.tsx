import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FullUserProfile, Platform } from "@/types";
import { formatPlatformLabel } from "@/lib/formatters";
import { pitchCache } from "@/utils/pitchCache";
import { Skeleton } from "@/components/Skeleton";

interface PitchButtonProps {
  profile: FullUserProfile;
  platform: Platform;
}

interface PitchState {
  username: string;
  loading: boolean;
  pitch: string | null;
  error: string | null;
}

export function PitchButton({ profile, platform }: PitchButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [state, setState] = useState<PitchState>(() => ({
    username: profile.username,
    loading: false,
    pitch: pitchCache.get(profile.username) || null,
    error: null,
  }));

  const matchesProfile = state.username === profile.username;
  const loading = matchesProfile ? state.loading : false;
  const pitch = matchesProfile ? state.pitch : (pitchCache.get(profile.username) || null);
  const error = matchesProfile ? state.error : null;

  const handleGenerate = async () => {
    if (pitchCache.has(profile.username)) {
      setState({
        username: profile.username,
        loading: false,
        pitch: pitchCache.get(profile.username)!,
        error: null,
      });
      return;
    }

    setState({
      username: profile.username,
      loading: true,
      pitch: null,
      error: null,
    });

    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: profile.fullname,
          username: profile.username,
          platform: formatPlatformLabel(platform),
          followers: profile.followers,
          engagement_rate: profile.engagement_rate,
          brand_affinity: profile.brand_affinity?.map((b) => b.name),
          top_hashtags: profile.top_hashtags?.map((t) => t.tag),
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = (await res.json()) as { pitch?: string; error?: string };
      if (!data.pitch) {
        throw new Error(data.error || "Empty pitch response");
      }

      pitchCache.set(profile.username, data.pitch);
      setState({
        username: profile.username,
        loading: false,
        pitch: data.pitch,
        error: null,
      });
    } catch {
      setState({
        username: profile.username,
        loading: false,
        pitch: null,
        error: "Couldn't generate a pitch right now — try again in a moment.",
      });
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border-strong)",
          color: "var(--text)",
        }}
      >
        <Sparkles size={16} style={{ color: "var(--accent)" }} />
        Generate pitch
      </button>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="skeleton"
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeInOut" }}
            className="w-full overflow-hidden"
          >
            <div
              className="mt-2 p-4 rounded-2xl"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
              role="status"
              aria-label="Generating pitch"
            >
              <div
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--accent)" }}
              >
                <Sparkles size={14} />
                <span>Generating pitch for @{profile.username}...</span>
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[75%]" />
              </div>
            </div>
          </motion.div>
        )}

        {!loading && pitch && (
          <motion.div
            key="pitch"
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeInOut" }}
            className="w-full overflow-hidden"
          >
            <div
              className="mt-2 p-4 rounded-2xl"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--accent)" }}
              >
                <Sparkles size={14} />
                AI Creator Pitch
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {pitch}
              </p>
            </div>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div
            key="error"
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeInOut" }}
            className="w-full overflow-hidden"
          >
            <div
              className="mt-2 p-4 rounded-2xl"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
