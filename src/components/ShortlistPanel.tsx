import { X, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useShortlistStore } from "@/store/shortlistStore";
import { formatCount, formatPlatformLabel } from "@/lib/formatters";

interface ShortlistPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ShortlistPanel({ open, onClose }: ShortlistPanelProps) {
  const entries = useShortlistStore((s) => s.entries);
  const remove = useShortlistStore((s) => s.remove);
  const clear = useShortlistStore((s) => s.clear);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.6)" }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shortlisted profiles"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col transition-transform duration-250 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 h-16 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="font-semibold text-base"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Shortlist
            <span className="ml-2 font-normal text-sm" style={{ color: "var(--text-muted)" }}>
              {entries.length} {entries.length === 1 ? "profile" : "profiles"}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortlist"
            className="p-1.5 rounded-md cursor-pointer transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Your shortlist is empty
              </p>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                Add profiles from search results to build your list.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {entries.map(({ profile, platform }) => (
                <li
                  key={`${platform}:${profile.user_id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl group"
                  style={{ background: "var(--surface-raised)" }}
                >
                  <img
                    src={profile.picture}
                    alt={`${profile.fullname} avatar`}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    style={{ border: "1px solid var(--border-strong)" }}
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${profile.username}?platform=${platform}`}
                      onClick={onClose}
                      className="text-sm font-medium truncate block hover:underline"
                      style={{ color: "var(--text)" }}
                    >
                      @{profile.username}
                    </Link>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {formatPlatformLabel(platform)} · {formatCount(profile.followers)}
                    </p>
                  </div>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open @${profile.username} on ${platform}`}
                    className="p-1.5 rounded-md shrink-0 transition-colors hover:opacity-80"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(profile.user_id, platform)}
                    aria-label={`Remove @${profile.username} from shortlist`}
                    className="p-1.5 rounded-md shrink-0 transition-colors cursor-pointer hover:opacity-80"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="p-4 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={clear}
              className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{
                background: "transparent",
                border: "1px solid var(--border-strong)",
                color: "var(--text-muted)",
              }}
            >
              Clear shortlist
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
