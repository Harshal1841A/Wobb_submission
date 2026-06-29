import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Platform, UserProfileSummary } from "@/types";

export interface ShortlistEntry {
  profile: UserProfileSummary;
  platform: Platform;
  addedAt: number;
}

interface ShortlistState {
  entries: ShortlistEntry[];
  add: (profile: UserProfileSummary, platform: Platform) => void;
  remove: (userId: string, platform: Platform) => void;
  toggle: (profile: UserProfileSummary, platform: Platform) => void;
  clear: () => void;
  has: (userId: string, platform: Platform) => boolean;
}

/** Composite key — a user_id is only unique within a platform here. */
function keyOf(userId: string, platform: Platform) {
  return `${platform}:${userId}`;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      entries: [],

      add: (profile, platform) => {
        if (get().has(profile.user_id, platform)) return; // prevent duplicates
        set((state) => ({
          entries: [...state.entries, { profile, platform, addedAt: Date.now() }],
        }));
      },

      remove: (userId, platform) => {
        set((state) => ({
          entries: state.entries.filter(
            (e) => keyOf(e.profile.user_id, e.platform) !== keyOf(userId, platform)
          ),
        }));
      },

      toggle: (profile, platform) => {
        if (get().has(profile.user_id, platform)) {
          get().remove(profile.user_id, platform);
        } else {
          get().add(profile, platform);
        }
      },

      clear: () => set({ entries: [] }),

      has: (userId, platform) => {
        const key = keyOf(userId, platform);
        return get().entries.some((e) => keyOf(e.profile.user_id, e.platform) === key);
      },
    }),
    {
      name: "scout-shortlist", // localStorage key — survives page refresh
      version: 1,
    }
  )
);
