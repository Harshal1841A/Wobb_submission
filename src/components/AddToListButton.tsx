import { Check, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { Platform, UserProfileSummary } from "@/types";
import { useShortlistStore } from "@/store/shortlistStore";

interface AddToListButtonProps {
  profile: UserProfileSummary;
  platform: Platform;
  variant?: "compact" | "full";
  stopPropagation?: boolean;
}

function AnimatedSwapIcon({ isAdded }: { isAdded: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isAdded ? "check" : "plus"}
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
        className="flex items-center justify-center"
      >
        {isAdded ? <Check size={16} /> : <Plus size={16} />}
      </motion.span>
    </AnimatePresence>
  );
}

export function AddToListButton({
  profile,
  platform,
  variant = "compact",
  stopPropagation = false,
}: AddToListButtonProps) {
  const isAdded = useShortlistStore((s) => s.has(profile.user_id, platform));
  const toggle = useShortlistStore((s) => s.toggle);

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    toggle(profile, platform);
  };

  const label = isAdded ? "Added to shortlist" : "Add to shortlist";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isAdded}
        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold cursor-pointer transition-all border"
        style={
          isAdded
            ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent-border)" }
            : { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
        }
      >
        <AnimatedSwapIcon isAdded={isAdded} />
        {isAdded ? "In Dossier" : "Add to Dossier"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={(e) => { if (stopPropagation) e.stopPropagation(); }}
      aria-pressed={isAdded}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 shrink-0 cursor-pointer transition-all border"
      style={
        isAdded
          ? { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
          : { background: "var(--surface-raised)", color: "var(--text)", borderColor: "var(--border)" }
      }
    >
      <AnimatedSwapIcon isAdded={isAdded} />
      <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
        {isAdded ? "Shortlisted" : "+ Shortlist"}
      </span>
    </button>
  );
}

