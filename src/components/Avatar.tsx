import { useState } from "react";
import { User } from "lucide-react";
import { getInitials, getGradient } from "../lib/avatarHelpers";

interface AvatarProps {
  src?: string;
  name?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ src, name, alt, className = "", style }: AvatarProps) {
  const [imgState, setImgState] = useState<{ src?: string; hasError: boolean }>({
    src,
    hasError: false,
  });

  if (imgState.src !== src) {
    setImgState({ src, hasError: false });
  }

  const initials = getInitials(name || alt);
  const seed = (name || alt || "avatar").toLowerCase();

  if (!src || imgState.hasError) {
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
      onError={() => setImgState((prev) => ({ ...prev, hasError: true }))}
    />
  );
}

