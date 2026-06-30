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
        className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors"
        style={{ borderColor: "var(--border)", background: "rgba(251,249,245,0.88)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl shrink-0 tracking-tight transition-opacity hover:opacity-80"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            <span
              className="w-7 h-7 flex items-center justify-center text-xs font-bold tracking-widest uppercase"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              C.
            </span>
            <span className="italic font-semibold">CURATED</span>
          </Link>

          {title && (
            <h1
              className="hidden sm:block text-xs uppercase tracking-widest truncate flex-1 text-center font-medium"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              {title}
            </h1>
          )}

          {onOpenShortlist && (
            <button
              type="button"
              onClick={onOpenShortlist}
              className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: "var(--text)",
              }}
              aria-label={`Open shortlist, ${count} profile${count === 1 ? "" : "s"}`}
            >
              <Layers size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Dossier</span>
              <span
                className="min-w-5 h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{
                  background: count > 0 ? "var(--accent)" : "var(--border-strong)",
                  color: count > 0 ? "var(--on-accent)" : "var(--text-muted)",
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
