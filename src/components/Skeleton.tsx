import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", style, ...props }: SkeletonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="skeleton"
      className={`relative overflow-hidden rounded-lg bg-[#1c1c26] border border-[#26252f] ${className}`}
      style={style}
      {...props}
    >
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
