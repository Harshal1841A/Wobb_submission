import { useMemo } from "react";
import type { Platform } from "@/types";
import { extractProfiles, filterProfiles } from "@/utils/dataHelpers";

/**
 * Memoizes profile extraction + filtering.
 * Previously SearchPage recomputed extractProfiles() (a full JSON->array map)
 * on every render, including renders triggered by unrelated state changes.
 */
export function useProfileSearch(
  platform: Platform,
  query: string
) {
  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);
  const filtered = useMemo(() => {
    return filterProfiles(allProfiles, query);
  }, [allProfiles, query]);

  return { allProfiles, filtered };
}
