import type { ProfileDetailResponse } from "@/types";

const profileModules = import.meta.glob<ProfileDetailResponse>(
  "../assets/data/profiles/*.json"
);

export async function loadProfileByUsername(
  username: string
): Promise<ProfileDetailResponse | null> {
  const path = `../assets/data/profiles/${username}.json`;
  const loader = profileModules[path];

  if (!loader) {
    return null;
  }

  const result = await loader();
  const data =
    (result as { default?: ProfileDetailResponse }).default ?? result;
  return data as ProfileDetailResponse;
}

let brandAffinityIndexCache: Record<string, string[]> | null = null;

export async function loadBrandAffinityIndex(): Promise<Record<string, string[]>> {
  if (brandAffinityIndexCache) return brandAffinityIndexCache;

  const index: Record<string, string[]> = {};
  const entries = Object.entries(profileModules);

  for (const [path, loader] of entries) {
    try {
      const result = await loader();
      const data = (result as { default?: ProfileDetailResponse }).default ?? result;
      const profile = (data as ProfileDetailResponse)?.data?.user_profile;
      if (profile) {
        const brands = profile.brand_affinity?.map((b) => b.name) ?? [];
        if (profile.username) index[profile.username.toLowerCase()] = brands;
        // Also derive filename from path just in case
        const filenameMatch = path.match(/\/([^/]+)\.json$/);
        if (filenameMatch?.[1]) {
          index[filenameMatch[1].toLowerCase()] = brands;
        }
      }
    } catch {
      // Ignore errors loading individual profiles
    }
  }

  brandAffinityIndexCache = index;
  return index;
}
