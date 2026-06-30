import { useState, useRef } from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  name?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", // Indigo
  "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Pink
  "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald
  "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // Amber
  "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Purple
  "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)", // Teal
  "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", // Rose
];

function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "";
  const cleaned = name.trim();
  
  // Ignore common stop words in multi-word names
  const stopWords = new Set(["and", "the", "of", "in", "&"]);
  const words = cleaned.split(/[\s-]+/).filter((w) => Boolean(w) && !stopWords.has(w.toLowerCase()));
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  if (words.length === 1) {
    const word = words[0];
    // If single word has uppercase letters inside (e.g. MrBeast -> MB, PewDiePie -> PD)
    const upperChars = word.split("").filter((c) => c >= "A" && c <= "Z");
    if (upperChars.length >= 2) {
      return (upperChars[0] + upperChars[1]).toUpperCase();
    }
    return word.slice(0, 2).toUpperCase();
  }
  
  return cleaned.slice(0, 2).toUpperCase();
}

export function Avatar({ src, name, alt, className = "", style }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const prevSrcRef = useRef(src);

  if (src !== prevSrcRef.current) {
    prevSrcRef.current = src;
    setHasError(false);
  }

  const initials = getInitials(name || alt);
  const seed = (name || alt || "avatar").toLowerCase();

  if (!src || hasError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center shrink-0 font-semibold select-none text-white shadow-inner ${className}`}
        style={{
          background: getGradient(seed),
          border: "1px solid rgba(255, 255, 255, 0.15)",
          letterSpacing: "0.02em",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        {initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 opacity-80" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ border: "1px solid var(--border-strong)", ...style }}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
