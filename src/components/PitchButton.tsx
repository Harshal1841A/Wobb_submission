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
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all border hover:bg-black hover:text-white disabled:opacity-50 cursor-pointer"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-strong)",
          color: "var(--text)",
        }}
      >
        <Sparkles size={14} />
        Generate Dossier Memo
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
              className="mt-4 p-6 border bg-[#FBF9F5]"
              style={{ borderColor: "var(--border)" }}
              role="status"
              aria-label="Generating pitch"
            >
              <div
                className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest mb-4 text-stone-500"
              >
                <Sparkles size={12} />
                <span>SYNTHESIZING EDITORIAL MEMORANDUM FOR @{profile.username}...</span>
              </div>
              <div className="space-y-3">
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
              className="mt-4 p-6 border bg-[#FBF9F5] relative"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <div
                className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest mb-3 pb-3 border-b border-stone-300 text-stone-600"
              >
                <span className="flex items-center gap-1.5 font-bold text-black">
                  <Sparkles size={12} />
                  EDITORIAL DOSSIER MEMORANDUM
                </span>
                <span>CONFIDENTIAL // BRAND ALIGNMENT</span>
              </div>
              <p className="text-base sm:text-lg italic leading-relaxed font-normal py-2 flex gap-1" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                <span className="select-none opacity-40">“</span>
                <span>{pitch}</span>
                <span className="select-none opacity-40">”</span>
              </p>
              <div
                className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mt-4 pt-3 border-t text-stone-400"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(pitch)}
                  className="px-2 py-1 border border-stone-300 bg-white text-black font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  [ COPY MEMO ]
                </button>
                <span>SYNTHESIZED FROM VERIFIED PROVENANCE</span>
              </div>
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
              className="mt-4 p-5 border bg-[#FBF9F5]"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-xs font-mono uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--danger)" }}>
                <span className="font-bold shrink-0">[ERR]</span>
                <span>{error}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
