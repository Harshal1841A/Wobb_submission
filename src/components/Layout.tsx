import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { useShortlistStore } from "@/store/shortlistStore";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  onOpenShortlist?: () => void;
}

export function Layout({ children, title, onOpenShortlist }: LayoutProps) {
  const count = useShortlistStore((s) => s.entries.length);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ borderColor: "var(--border)", background: "rgba(11,11,16,0.85)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg shrink-0"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)", color: "#0b0b10" }}
            >
              S
            </span>
            Scout
          </Link>

          {title && (
            <h1
              className="hidden sm:block text-sm truncate flex-1 text-center"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              {title}
            </h1>
          )}

          {onOpenShortlist && (
            <button
              type="button"
              onClick={onOpenShortlist}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 cursor-pointer"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border-strong)",
                color: "var(--text)",
              }}
              aria-label={`Open shortlist, ${count} profile${count === 1 ? "" : "s"}`}
            >
              <Layers size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Shortlist</span>
              <span
                className="min-w-5 h-5 px-1 rounded-full text-xs flex items-center justify-center font-semibold"
                style={{
                  background: count > 0 ? "var(--accent)" : "var(--border-strong)",
                  color: count > 0 ? "#0b0b10" : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
