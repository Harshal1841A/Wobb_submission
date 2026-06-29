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
  query: string,
  selectedBrand: string = "All",
  brandAffinityMap: Record<string, string[]> = {}
) {
  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);
  const filtered = useMemo(() => {
    let list = filterProfiles(allProfiles, query);
    if (selectedBrand !== "All") {
      list = list.filter((p) => {
        const brands = brandAffinityMap[p.username.toLowerCase()] || brandAffinityMap[p.user_id] || [];
        return brands.includes(selectedBrand);
      });
    }
    return list;
  }, [allProfiles, query, selectedBrand, brandAffinityMap]);

  return { allProfiles, filtered };
}
