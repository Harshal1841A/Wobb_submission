import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";
import { SearchX } from "lucide-react";

interface ProfileListProps {
  profiles: UserProfileSummary[];
  platform: Platform;
}

export function ProfileList({ profiles, platform }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <SearchX size={28} style={{ color: "var(--text-faint)" }} aria-hidden="true" />
        <p className="font-medium" style={{ color: "var(--text)" }}>No profiles found</p>
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          Try a different search term or platform.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
      {profiles.map((profile) => (
        <li key={profile.user_id}>
          <ProfileCard profile={profile} platform={platform} />
        </li>
      ))}
    </ul>
  );
}
